// src/controllers/musicController.js
const prisma = require("../lib/prisma");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/music — public, returns the single active track
const getActiveMusic = async (req, res, next) => {
  try {
    const track = await prisma.music.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(track || null);
  } catch (err) {
    next(err);
  }
};

// GET /api/music/all — admin, returns all tracks
const getAllMusic = async (req, res, next) => {
  try {
    const tracks = await prisma.music.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(tracks);
  } catch (err) {
    next(err);
  }
};

// POST /api/music — admin, upload a new track and set it as active
const uploadMusic = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Audio file is required" });
    }

    // Upload to Cloudinary as raw resource
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "video", folder: "onfleek/music" },
        (err, result) => (err ? reject(err) : resolve(result)),
      );
      stream.end(req.file.buffer);
    });

    // Deactivate all existing tracks
    await prisma.music.updateMany({ data: { isActive: false } });

    // Create new active track
    const track = await prisma.music.create({
      data: {
        title: title.trim(),
        url: result.secure_url,
        publicId: result.public_id,
        isActive: true,
      },
    });

    return res.status(201).json(track);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/music/:id/activate — admin, set a track as active
const activateMusic = async (req, res, next) => {
  try {
    await prisma.music.updateMany({ data: { isActive: false } });
    const track = await prisma.music.update({
      where: { id: req.params.id },
      data: { isActive: true },
    });
    return res.json(track);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/music/:id — admin, delete a track
const deleteMusic = async (req, res, next) => {
  try {
    const track = await prisma.music.findUnique({
      where: { id: req.params.id },
    });
    if (!track) {
      return res.status(404).json({ error: "Track not found" });
    }

    // Delete from Cloudinary
    await cloudinary.uploader
      .destroy(track.publicId, {
        resource_type: "video",
      })
      .catch(() => {});

    await prisma.music.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getActiveMusic,
  getAllMusic,
  uploadMusic,
  activateMusic,
  deleteMusic,
};
