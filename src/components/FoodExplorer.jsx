import React, { useState, useEffect } from "react";

const FoodExplorer = () => {
  const [categories, setCategories] = useState([]);
  const [foodNames, setFoodNames] = useState([]);
  const [tables, setTables] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedData, setSelectedData] = useState({
    category: "",
    foodName: "",
    table: "",
    table2: "", // Store proximate sub selection
    column: "",
  });
  const [tableData, setTableData] = useState(null); // Dynamic table data

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/categories/unique-codes"
      );
      if (!response.ok) {
        throw new Error(`Error fetching categories: ${response.statusText}`);
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  // Fetch food names based on category code
  const fetchFoodNames = async (categoryCode) => {
    try {
      const response = await fetch(
        `http://localhost:3000/categories/${categoryCode}/unique-food-names`
      );
      if (!response.ok) {
        throw new Error(`Error fetching food names: ${response.statusText}`);
      }
      const data = await response.json();
      setFoodNames(data);
    } catch (error) {
      console.error("Failed to fetch food names:", error);
    }
  };

  // Fetch tables based on category and food name
  const fetchTables = async (categoryCode, foodName) => {
    try {
      const response = await fetch(
        `http://localhost:3000/tables/for-selection?categoryCode=${categoryCode}&foodName=${foodName}`
      );
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error("Failed to fetch tables:", error);
      setTables([]);
    }
  };

  // Fetch columns based on selected table
  const fetchColumns = async (tableId) => {
    if (!tableId) return;
    try {
      const response = await fetch(
        `http://localhost:3000/nutrient-columns?categoryCode=${selectedData.category}&foodName=${selectedData.foodName}&tableId=${tableId}`
      );
      const data = await response.json();
      setColumns(data);
    } catch (error) {
      console.error("Failed to fetch columns:", error);
      setColumns([]);
    }
  };

  // Fetch table data based on selected table and columns
  const fetchTableData = async () => {
    if (!selectedData.table || !selectedData.column) return;

    try {
      const response = await fetch(
        `http://localhost:3000/table-data?categoryCode=${selectedData.category}&foodName=${selectedData.foodName}&tableId=${selectedData.table}&column=${selectedData.column}`
      );
      const data = await response.json();
      setTableData(data);
    } catch (error) {
      console.error("Failed to fetch table data:", error);
      setTableData(null);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedData.category) fetchFoodNames(selectedData.category);
  }, [selectedData.category]);

  useEffect(() => {
    if (selectedData.foodName)
      fetchTables(selectedData.category, selectedData.foodName);
  }, [selectedData.foodName]);

  useEffect(() => {
    if (selectedData.table) fetchColumns(selectedData.table);
  }, [selectedData.table]);

  useEffect(() => {
    fetchTableData();
  }, [selectedData.table, selectedData.column]);

  const handleChange = async (field, value) => {
    setSelectedData((prev) => ({ ...prev, [field]: value }));
    if (field === "category") {
      setSelectedData({
        category: value,
        foodName: "",
        table: "",
        table2: "",
        column: "",
      });
      setColumns([]);
      setTables([]);
    }
    if (field === "foodName") {
      setSelectedData((prev) => ({
        ...prev,
        foodName: value,
        column: "",
        table2: "",
      }));
      setColumns([]);
      setTables([]);
    }
    if (field === "table") {
      setSelectedData((prev) => ({ ...prev, table: value, column: "" }));
      setColumns([]);
    }

    console.log(selectedData)
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {/* Food Categories Dropdown */}
          <div className="relative">
            <div className="p-2 border border-gray-600 rounded-lg bg-gray-800">
              <h3 className="text-sm font-medium mb-2">FOOD CATEGORIES</h3>
              <select
                value={selectedData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.code} value={category.code}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Food Names Dropdown */}
          <div className="relative">
            <div className="p-2 border border-gray-600 rounded-lg bg-gray-800">
              <h3 className="text-sm font-medium mb-2">FOOD NAMES</h3>
              <select
                value={selectedData.foodName}
                onChange={(e) => handleChange("foodName", e.target.value)}
                className="w-full outline-none"
                disabled={!selectedData.category}
              >
                <option value="">Select Food</option>
                {foodNames.map((food) => (
                  <option key={food} value={food}>
                    {food}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Selection Dropdown */}
          <div className="relative">
            <div className="p-2 border border-gray-600 rounded-lg bg-gray-800">
              <h3 className="text-sm font-medium mb-2">TABLE SELECTION</h3>
              <select
                value={selectedData.table}
                onChange={(e) => handleChange("table", e.target.value)}
                className="w-full outline-none"
                disabled={!selectedData.foodName}
              >
                <option value="">Select Table</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Proximate Sub Dropdown (COLUMNS) */}
          <div className="relative">
            <div className="p-2 border border-gray-600 rounded-lg bg-gray-800">
              <h3 className="text-sm font-medium mb-2">PROXIMATE SUB</h3>
              <select
                value={selectedData.table2}
                onChange={(e) => handleChange("table2", e.target.value)}
                className="w-full outline-none"
                disabled={!selectedData.foodName}
              >
                <option value="">Select Column</option>
                {columns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Table */}
        {selectedData.table && tableData && tableData.length > 0 ? (
          <div className="mt-8">
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">
                {selectedData.category}
              </h2>
              <table className="w-full">
                <thead>
                  <tr>
                    {columns.length > 0 &&
                      columns.map((column, idx) => (
                        <th key={idx} className="text-left py-2">
                          {column}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={index}>
                      {columns.map((column, idx) => (
                        <td key={idx} className="py-2">
                          {row[column] || "N/A"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <p className="text-center text-gray-400">
              No data available for the selected table.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodExplorer;
