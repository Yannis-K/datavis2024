export function getAllDataFromCSV(csvFilePath) {
  return axios
    .get(csvFilePath)
    .then((response) => {
      const csvData = response.data;

      const rows = csvData.split("\n");
      const header = rows[0].split(",");

      // console.log("***HEADER", header);

      let counter = 0;

      const data = rows.slice(1).map((row) => {
        // Use a regular expression to handle quoted fields with commas
        const columns = row.match(/(?:[^,"]|"(?:\\.|[^"])*")+/g);

        // Check if the number of columns matches the header length
        if (columns && columns.length === header.length) {
          const rowData = header.reduce((acc, key, columnIndex) => {
            acc[key.trim()] = columns[columnIndex]
              .trim()
              .replace(/^"(.*)"$/, "$1");
            return acc;
          }, {});

          // Log columns with the counter
          //console.log(`Row Counter ${++counter}:`, rowData);

          return rowData;
        } else {
          console.error(
            `Row has an incorrect number of columns or is not formatted correctly: ${row}`
          );
          return null; // or handle this case accordingly
        }
      });

      const filteredData = data.filter((item) => item !== null); // Remove entries with incorrect number of columns

      return filteredData;
    })
    .catch((error) => {
      console.error("Error fetching or parsing CSV data:", error);
      throw error; // Rethrow the error for further handling if needed
    });
}
