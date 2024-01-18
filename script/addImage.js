import fs from "fs";
import csvParser from "csv-parser";
import _ from "lodash";
import createCsvWriter from "csv-writer";
import axios from "axios";
import { count } from "console";

const getImageNobel = async (author) => {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&pithumbsize=300&titles=${encodeURIComponent(
      author
    )}`;
    const response = await axios.get(url);
    const pages = response.data.query.pages;
    const pageId = Object.keys(pages)[0];
    const authorInfo = pages[pageId];
    return { url: authorInfo.thumbnail, imageName: authorInfo.pageimage || "" };
  } catch (e) {
    if (e.response && e.response.data) console.error(e.response.data);
    else console.error(e);
    throw new Error(`Failed to get image ${author}`);
  }
};

const fetchData = async (path) => {
  try {
    const data = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(path)
        .pipe(csvParser())
        .on("data", (row) => {
          if (Object.keys(row).length !== 0) {
            data.push(row);
          }
        })
        .on("end", () => {
          console.log("CSV file successfully processed");
          resolve(data);
        })
        .on("error", (error) => {
          console.error("Error processing CSV:", error);
          reject(error);
        });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const writeDataToCSV = async (geocodedData, outputPath) => {
  const csvWriter = createCsvWriter.createObjectCsvWriter({
    path: outputPath,
    header: Object.keys(geocodedData[0]).map((key) => ({
      id: key,
      title: key,
    })),
  });

  await csvWriter.writeRecords(geocodedData);
  console.log(`CSV data written to ${outputPath}`);
};

const downloadImages = async (data) => {
  const folderPath = "./downloaded_images";
  const failedDownloads = [];

  await Promise.all(
    data.map(async (row, index) => {
      const imageUrl = row.imageUrl;
      try {
        const response = await axios.get(imageUrl);
        if (!response) {
          throw new Error(`Failed to download image at index ${index}`);
        }

        const imageName = row.imageName;

        // Convert response.data directly to Buffer
        const buffer = Buffer.from(response.data);

        // Save the image to the folder
        await fs.promises.writeFile(`${folderPath}/${imageName}`, buffer);

        console.log(`Downloaded image: ${imageName}`);
      } catch (error) {
        console.error(error.message, row["full_name"]);
        failedDownloads.push(row["full_name"]);
      }
    })
  );

  console.log("All images downloaded successfully.");
  if (failedDownloads.length > 0) {
    console.log("Failed to download the following images:", failedDownloads);
  }
};

const hasDuplicates = (array, key) => {
  const values = new Set();
  const duplicate = new Set();
  let hasDup = false;
  for (const item of array) {
    const value = item[key];
    if (values.has(value)) {
      if (!hasDup) {
        hasDup = true;
      }
      duplicate.add(value);
    }
    values.add(value);
  }
  return { dup: hasDup, val: duplicate }; // No duplicates found
};

const processAddImage = async (path) => {
  try {
    const data = await fetchData(path);
    const geocodedData = await Promise.all(
      data.map(async (row) => {
        const author = row["full_name"];
        if (author.length === 0) return { ...row };
        const thumbnail = await getImageNobel(author);
        const image = thumbnail?.url?.source || "";
        return {
          ...row,
          imageUrl: image,
          imageName: thumbnail.imageName,
        };
      })
    );

    const filteredData = geocodedData.filter(
      (row) => row.imageUrl !== "" && row["laureate_type"] === "Individual"
    );

    const hasDuplicateFullNames = hasDuplicates(filteredData, "full_name");
    console.log("dup", hasDuplicateFullNames);
    await writeDataToCSV(filteredData, "./nobel_with_image.csv");
    // Download images
    await downloadImages(filteredData);
  } catch (error) {
    console.error("Error processing data:", error);
  }
};

processAddImage("./nobel.csv");

// getImageNobel("Albrecht Kossel");
