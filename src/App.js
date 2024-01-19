/* eslint-disable jsx-a11y/iframe-has-title */
import "./App.css";
import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import motVide from "./assets/motsVides.txt";
import ReactWordcloud from "react-wordcloud";

ChartJS.register(ArcElement, Tooltip, Legend);

const CustomInputDate = React.forwardRef((props, ref) => {
  const { value, onClick } = props;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "white",
        borderRadius: 4,
        border: "1px solid #CCCCCC",
        width: "200px",
        height: "38px",
      }}
    >
      <input
        style={{
          border: "none",
          textAlign: "center",
          minWidth: 0,
          maxWidth: 100,
          backgroundColor: "white",
          width: "100%",
        }}
        type="button"
        value={value}
        onClick={onClick}
        ref={ref}
      />
    </div>
  );
});
const DatePickerRange = ({
  setSelectedEndDate,
  setSelectedStartDate,
  selectedStartDate,
  selectedEndDate,
}) => {
  return (
    <div className="blocModalDatePickerRange">
      <DatePicker
        customInput={<CustomInputDate />}
        showYearPicker
        dateFormat="yyyy"
        selected={selectedStartDate}
        onChange={(date) => setSelectedStartDate(date)}
      />
      <HorizontalRuleIcon />
      <DatePicker
        customInput={<CustomInputDate />}
        showYearPicker
        dateFormat="yyyy"
        selected={selectedEndDate}
        onChange={(date) => setSelectedEndDate(date)}
      />
    </div>
  );
};

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = useState(
    new Date("1901-01-01")
  );
  const [selectedEndDate, setSelectedEndDate] = useState(
    new Date("2016-12-31")
  );
  const [pieData, setPieData] = useState({});
  const [wordCloudData, setWordCloudData] = useState([]);
  const [stopWords, setStopWords] = useState([]);

  useEffect(() => {
    const fetchStopWords = async () => {
      try {
        const response = await fetch(motVide);
        if (response.ok) {
          const content = await response.text();
          const stopWordsArray = content.split("\n").map((word) => word.trim());
          setStopWords(stopWordsArray);
        } else {
          console.error("Failed to fetch stop words");
        }
      } catch (error) {
        console.error("Error fetching stop words:", error);
      }
    };

    fetchStopWords();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await d3.csv("../dataset/nobel.csv");

        if (!response) {
          throw new Error("Data not found or inaccessible");
        }

        const finalData = response.map((nobel) => ({
          year: nobel.year,
          category: nobel.category,
          prize: nobel.prize,
          motivation: nobel.motivation,
          laureate_id: nobel.laureate_id,
          laureate_type: nobel.laureate_type,
          full_name: nobel.full_name,
          birth_date: nobel.birth_date,
          birth_country: nobel.birth_country,
          sex: nobel.sex,
          organization_name: nobel.organization_name,
          organization_country: nobel.organization_country,
          death_date: nobel.death_date,
        }));
        setData(finalData);
        setFilteredData(finalData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const newData = filteredData.filter(
      (nobel) =>
        nobel.year >= selectedStartDate.getFullYear() &&
        nobel.year <= selectedEndDate.getFullYear()
    );
    setFilteredData(newData);
  }, [selectedStartDate, selectedEndDate]);

  useEffect(() => {
    const wordcloud = indexationMotiv(
      filteredData.map((nobel) => nobel.motivation).join()
    );
    const transformedArray = Object.entries(wordcloud).map(([text, value]) => ({
      text: isNaN(text) ? text : parseInt(text),
      value,
    }));
    const getCategorie = (str) => {
      if (str) {
        const dataFiltered = filteredData.filter(
          (nobel) => nobel.category === str
        );
        return dataFiltered.length;
      }
    };
    const pie = {
      labels: [
        "Medicine",
        "Phisique",
        "Chimie",
        "Paix",
        "Literature",
        "Economique",
      ],
      datasets: [
        {
          label: "# de prix Nobel",
          data: [
            getCategorie("Medicine"),
            getCategorie("Physics"),
            getCategorie("Chemistry"),
            getCategorie("Peace"),
            getCategorie("Literature"),
            getCategorie("Economics"),
          ],
          backgroundColor: [
            "#6BC2B8", // Turquoise Pastel
            "#E6B8CA", // Rose Poudré
            "#AED9E0", // Bleu Ciel
            "#FFCBA4", // Oranger Doux
            "#D3D3E6", // Lavande Claire
            "#98FF98", // Vert Menthe
          ],
          borderWidth: 1,
        },
      ],
    };

    setWordCloudData(transformedArray);
    setPieData(pie);
  }, [filteredData]);

  const indexationMotiv = (fileContents) => {
    const strLowerCase = fileContents.toLowerCase();
    const pattern = /[!'";:\-.,…\]\[\(«»)\n\s]+/g;

    const res = strLowerCase.replace(pattern, " ");
    const table = res
      .split(" ")
      .filter((substr) => substr.length > 2 && !stopWords.includes(substr));

    const tableFinal = table.reduce((accumulator, currentValue) => {
      if (accumulator[currentValue]) accumulator[currentValue]++;
      else accumulator[currentValue] = 1;
      return accumulator;
    }, {});
    return tableFinal;
  };

  const renderValue = (str) => {
    if (str === "time") {
      const years = data.map((nobel) => nobel.year);

      const maxYear = Math.max(...years);
      const minYear = Math.min(...years);

      return `${minYear} - ${maxYear}`;
    }
    if (str === "total") {
      return `${data.length}`;
    }
    return "";
  };

  const renderCategorie = (str) => {
    if (str) {
      const dataFiltered = data.filter((nobel) => nobel.category === str);
      return `${dataFiltered.length}`;
    }
  };

  const renderGenre = (str) => {
    if (str) {
      const dataFiltered = data.filter((nobel) => nobel.sex === str);
      return `${dataFiltered.length}`;
    }
  };

  return (
    <div className="App">
      <div className="Block">
        <div className="BlockTitle">
          <span>informations générales</span>
        </div>
        <div className="mapSearch">
          <div className="map">
            <iframe
              src="https://public.opendatasoft.com/explore/embed/dataset/nobel-prize-laureates/map/?disjunctive.category&location=2,32.10119,-1.75781&basemap=jawg.light"
              width="100%"
              height="600"
            ></iframe>
          </div>
          <ul className="Side" id="buildingDataList">
            <li className="BuildingDataItem">
              <span className="BuildingDataLabel">Temps</span>
              <span className="BuildingDataValue">{renderValue("time")}</span>
            </li>
            <li className="BuildingDataItem">
              <span className="BuildingDataLabel">Total</span>
              <span className="BuildingDataValue">{renderValue("total")}</span>
            </li>
            <li className="BuildingDataItem">
              <span className="BuildingDataLabel">Medicine</span>
              <span className="BuildingDataValue">
                {renderCategorie("Medicine")}
              </span>
            </li>
            <li className="BuildingDataItem">
              <span className="BuildingDataLabel">Physique</span>
              <span className="BuildingDataValue">
                {renderCategorie("Physics")}
              </span>
            </li>
            <li className="BuildingDataItem">
              <span className="BuildingDataLabel">Chimie</span>
              <span className="BuildingDataValue">
                {renderCategorie("Chemistry")}
              </span>
            </li>
            <li className="BuildingDataItem">
              <span className="BuildingDataLabel">Paix</span>
              <span className="BuildingDataValue">
                {renderCategorie("Peace")}
              </span>
            </li>
            <li className="BuildingDataItem">
              <span className="BuildingDataLabel">Literature</span>
              <span className="BuildingDataValue">
                {renderCategorie("Literature")}
              </span>
            </li>
            <li className="BuildingDataItem">
              <span className="BuildingDataLabel">Economique</span>
              <span className="BuildingDataValue">
                {renderCategorie("Economics")}
              </span>
            </li>
            <li className="BuildingDataItem">
              <span className="BuildingDataLabel">Homme</span>
              <span className="BuildingDataValue">{renderGenre("Male")}</span>
            </li>
            <li className="BuildingDataItem">
              <span className="BuildingDataLabel">Femme</span>
              <span className="BuildingDataValue">{renderGenre("Female")}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="Block">
        <div className="BlockTitle">
          <span>les prix dans une durée précise</span>
        </div>

        <div>
          <DatePickerRange
            selectedEndDate={selectedEndDate}
            selectedStartDate={selectedStartDate}
            setSelectedEndDate={setSelectedEndDate}
            setSelectedStartDate={setSelectedStartDate}
          />
        </div>
        <div>
          {Object.keys(pieData).length > 0 && (
            <div style={{ display: "flex" }}>
              <div style={{ width: "50%" }}>
                <Pie data={pieData} />
              </div>
              <div style={{ width: "50%" }}>
                <ReactWordcloud
                  words={wordCloudData}
                  maxWords={20}
                  options={{
                    enableTooltip: true,
                    deterministic: false,
                    fontSizes: [20, 50],
                    fontStyle: "normal",
                    fontWeight: "normal",
                    padding: 1,
                    rotations: 3,
                    rotationAngles: [0, 0],
                    scale: "sqrt",
                    spiral: "archimedean",
                    transitionDuration: -1,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
