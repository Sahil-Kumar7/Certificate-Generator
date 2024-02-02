import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./FileHandler.css";

const FileHandler = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    // const [uploadStatus, setUploadStatus] = useState('Upload');
    // const [labelText, setLabelText] = useState('Select an Excel File');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("Please choose an Excel file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await axios.post(
                "https://donation-certificate-generator.onrender.com/upload",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            if (response.status === 200) {
                toast.success("File uploaded successfully!");
            } else {
                throw new Error("Unexpected response status.");
            }
        } catch (error) {
            console.error("Error uploading file:", error);

            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                toast.error(`Server error: ${error.response.status}`);
            } else if (error.request) {
                // The request was made but no response was received
                toast.error("No response received from the server.");
            } else {
                // Something happened in setting up the request that triggered an Error
                toast.error("Error in request setup.");
            }
        }
    };

    const handleResetFile = async () => {
        setSelectedFile(null);
        const fileInput = document.getElementById("file");
        if (fileInput) {
            fileInput.value = null;
        }
        toast.info('The file is removed');
    };

    return (
        <div className="main">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <ToastContainer />
            <nav><h1>Certificate Generator App</h1></nav>
            <div className="content">
                <div className="content-box">
                    <p>Upload an Excel file to generate donation certificates.</p>
                    <div className={`file-box${selectedFile ? " selected" : ""}`}>
                        <div className="file-icon">📄</div>
                        <label htmlFor="file" className="file-text">
                            {selectedFile ? selectedFile.name : "Select an Excel File"}
                            
                            <input type="file" id="file" onChange={handleFileChange} accept=".xlsx"/>
                        </label>
                    </div>
                    <div className="button-box">
                        <button className="upload" onClick={handleUpload}>
                            Upload File
                        </button>
                        <button onClick={handleResetFile} className="reset">
                            Reset File
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileHandler;
