
import React, { useState } from 'react';
import axios from 'axios';

const YtData = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    console.log("Selected file:", file);
    console.log("Selected filedata:", formData);
    console.log("FormData entries:");
  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`${key}: (File)`, {
        name: value.name,
        size: value.size,
        type: value.type,
      });
    } else {
      console.log(`${key}:`, value);
    }
  }
    try {
      await axios.post("http://localhost:9080/api/yt", formData,  {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    }
  };

  return (
    <div>
      <h3>Upload CSV</h3>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default YtData;

