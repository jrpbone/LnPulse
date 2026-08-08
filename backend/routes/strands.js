const express = require('express')
const router = express.Router()
const { STRAND_T } = require("../models");

router.get("/", async (req, res) => {
    const listOfStrands = await STRAND_T.findAll();
    res.json(listOfStrands);
})

// Get strand details
router.get("/:strand_id", async (req, res) => {
  const strand_id = req.params.strand_id;
  const strand = await STRAND_T.findOne({
    where: { strand_id },
  });
  res.json(strand);
});

// GET strands by department_id
router.get('/byDepartment/:department_id', async (req, res) => {
  const { department_id } = req.params;
  try {
    const strands = await STRAND_T.findAll({
      where: { department_id }
    });
    res.json(strands);
  } catch (err) {
    console.error("Error fetching strands by department:", err);
    res.status(500).json({ error: "Failed to fetch strands" });
  }
});

router.post("/", async (req, res) => {
    const strand = req.body;
    console.log("Incoming strand data:", strand);
    try {
        const created = await STRAND_T.create(strand);
        res.json(created);
    } catch (err) {
        console.error("Error inserting strand:", err);
        res.status(500).json({ error: "Failed to insert strand" });
    }
});

// Delete strand
router.delete("/:strand_id", async (req, res) => {
    const { strand_id } = req.params;
    try {
        await STRAND_T.destroy({
            where: { strand_id }
        });
        res.json({ message: "Strand deleted successfully" });
    } catch (err) {
        console.error("Error deleting strand:", err);
        res.status(500).json({ error: "Failed to delete strand" });
    }
});

// Update strand
router.put("/:strand_id", async (req, res) => {
    const { strand_id } = req.params;
    const updates = req.body;
    try {
        await STRAND_T.update(updates, {
            where: { strand_id }
        });
        const updatedStrand = await STRAND_T.findOne({
            where: { strand_id }
        });
        res.json(updatedStrand);
    } catch (err) {
        console.error("Error updating strand:", err);
        res.status(500).json({ error: "Failed to update strand" });
    }
});

module.exports = router;