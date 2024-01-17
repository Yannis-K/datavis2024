import { getAllDataFromCSV } from "./modules/data.js";

const DATASET_FILE_PATH = "./dataset/nobel_with_image.csv";

const DATA =
  (await getAllDataFromCSV(DATASET_FILE_PATH).catch((error) =>
    console.error("Error:", error)
  )) || [];
export { DATA };
