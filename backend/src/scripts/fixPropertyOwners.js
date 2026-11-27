
import "dotenv/config";

import mongoose from "mongoose";
import connectDB from "../config/db.js";

import User from "../models/User.js";
import Property from "../models/Property.js";

const propertyOwners = [
  { title: "Modern 2 BHK Apartment in New Town", ownerEmail: "agent1@homehunt.demo" },
  { title: "Spacious 3 BHK Apartment in Rajarhat", ownerEmail: "agent2@homehunt.demo" },
  { title: "Affordable 1 BHK Flat near Garia", ownerEmail: "agent3@homehunt.demo" },
  { title: "Premium 3 BHK Apartment in Whitefield", ownerEmail: "agent4@homehunt.demo" },
  { title: "City-view 2 BHK Apartment in Andheri", ownerEmail: "agent5@homehunt.demo" },
  { title: "Elegant 3 BHK Apartment in Gachibowli", ownerEmail: "agent1@homehunt.demo" },
  { title: "Compact 2 BHK Apartment in Wakad", ownerEmail: "agent2@homehunt.demo" },
  { title: "Luxury 4 BHK Apartment in Ballygunge", ownerEmail: "agent3@homehunt.demo" },
  { title: "Independent 3 BHK House in Behala", ownerEmail: "agent4@homehunt.demo" },
  { title: "Family Home with Garden in Jayanagar", ownerEmail: "agent5@homehunt.demo" },
  { title: "4 BHK Independent House in Powai", ownerEmail: "agent1@homehunt.demo" },
  { title: "Duplex Family House in Kukatpally", ownerEmail: "agent2@homehunt.demo" },
  { title: "Ready-to-move 2 BHK House in Kothrud", ownerEmail: "agent3@homehunt.demo" },
  { title: "Modern 3 BHK House in Salt Lake", ownerEmail: "agent4@homehunt.demo" },
  { title: "Corner Plot Independent House in HSR Layout", ownerEmail: "agent5@homehunt.demo" },
  { title: "Luxury Pool Villa in ECR-style Gated Community", ownerEmail: "agent1@homehunt.demo" },
  { title: "Contemporary 4 BHK Villa in Sarjapur", ownerEmail: "agent2@homehunt.demo" },
  { title: "Sea-facing Luxury Villa in Juhu", ownerEmail: "agent3@homehunt.demo" },
  { title: "Premium Gated Villa in Mokila", ownerEmail: "agent4@homehunt.demo" },
  { title: "Hill-view 3 BHK Villa in Bavdhan", ownerEmail: "agent2@homehunt.demo" },
  { title: "Furnished Office Space in Sector V", ownerEmail: "agent1@homehunt.demo" },
  { title: "Retail Showroom on MG Road", ownerEmail: "agent2@homehunt.demo" },
  { title: "Commercial Office Floor in Andheri East", ownerEmail: "agent3@homehunt.demo" },
  { title: "IT Office Space in HITEC City", ownerEmail: "agent4@homehunt.demo" },
  { title: "Commercial Shop in Baner", ownerEmail: "agent5@homehunt.demo" },
  { title: "Residential Plot in New Town", ownerEmail: "agent1@homehunt.demo" },
  { title: "Corner Residential Plot in Devanahalli", ownerEmail: "agent2@homehunt.demo" },
  { title: "Premium Residential Land in Panvel", ownerEmail: "agent3@homehunt.demo" },
  { title: "Villa Plot in Shankarpally", ownerEmail: "agent4@homehunt.demo" },
  { title: "Residential Plot near Hinjawadi", ownerEmail: "agent5@homehunt.demo" },
];

const fixPropertyOwners = async () => {
  try {
    await connectDB();

    console.log("\nStarting property ownership migration...\n");

    // Find all five agents first.
    const emails = [
      ...new Set(propertyOwners.map((item) => item.ownerEmail)),
    ];

    const agents = await User.find({
      email: { $in: emails },
      role: "agent",
    }).select("_id email");

    const agentMap = new Map(
      agents.map((agent) => [agent.email.toLowerCase(), agent._id])
    );

    const missingAgents = emails.filter(
      (email) => !agentMap.has(email.toLowerCase())
    );

    if (missingAgents.length > 0) {
      throw new Error(
        `Missing agent accounts: ${missingAgents.join(", ")}`
      );
    }

    // Verify all properties exist before changing anything.
    const titles = propertyOwners.map((item) => item.title);

    const existingProperties = await Property.find({
      title: { $in: titles },
    }).select("_id title owner");

    const propertyMap = new Map(
      existingProperties.map((property) => [
        property.title,
        property,
      ])
    );

    const missingProperties = titles.filter(
      (title) => !propertyMap.has(title)
    );

    if (missingProperties.length > 0) {
      throw new Error(
        `Properties not found:\n${missingProperties.join("\n")}`
      );
    }

    // Prepare updates. No other property fields are modified.
    const operations = propertyOwners.map((item) => ({
      updateOne: {
        filter: { _id: propertyMap.get(item.title)._id },
        update: {
          $set: {
            owner: agentMap.get(item.ownerEmail.toLowerCase()),
          },
        },
      },
    }));

    const result = await Property.bulkWrite(operations);

    console.log("Migration completed successfully!");
    console.log("Matched properties:", result.matchedCount);
    console.log("Modified properties:", result.modifiedCount);

    // Verify ownership distribution.
    const ownershipSummary = await Property.aggregate([
      {
        $match: {
          owner: { $in: agents.map((agent) => agent._id) },
        },
      },
      {
        $group: {
          _id: "$owner",
          totalProperties: { $sum: 1 },
        },
      },
    ]);

    console.log("\nProperty ownership summary:");

    for (const agent of agents) {
      const summary = ownershipSummary.find(
        (item) => item._id.toString() === agent._id.toString()
      );

      console.log(
        `${agent.email}: ${summary?.totalProperties || 0} properties`
      );
    }
  } catch (error) {
    console.error("\nMigration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("\nMongoDB connection closed.");
  }
};

fixPropertyOwners();
