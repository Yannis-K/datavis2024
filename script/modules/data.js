export function getAllDataFromCSV(csvFilePath) {
  return axios
    .get(csvFilePath)
    .then((response) => {
      const csvData = response.data;

      const rows = csvData.split("\n");
      const header = rows[0].split(",");

      const data = rows.slice(1).map((row) => {
        const columns = row.split(",");

        // Check if the number of columns matches the header length
        if (columns.length === header.length) {
          return header.reduce((acc, key, index) => {
            acc[key.trim()] = columns[index].trim();
            return acc;
          }, {});
        } else {
          console.error(`Row has an incorrect number of columns: ${row}`);
          return null; // or handle this case accordingly
        }
      });

      return data.filter((item) => item !== null); // Remove entries with incorrect number of columns
    })
    .catch((error) => {
      console.error("Error fetching or parsing CSV data:", error);
    });
}
