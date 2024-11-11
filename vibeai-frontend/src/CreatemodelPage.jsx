import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactMediaRecorder } from 'react-media-recorder';
import './createmodel.css';

function CreatemodelPage() {
    const navigate = useNavigate();
    const [showRecordingSection, setShowRecordingSection] = useState(false);
    const [modelName, setModelName] = useState('');
    const [language, setLanguage] = useState('English');
    const [gender, setGender] = useState('male');
    const [mp3File, setMp3File] = useState(null);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [resultMessage, setResultMessage] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [recordBlobLink, setRecordBlobLink] = useState('');

    const handleFileChange = (e) => {
        setMp3File(e.target.files[0]);
    };

    const handleSubmitFile = async (e) => {
        e.preventDefault();
        if (!mp3File) {
            alert("Please select an MP3 file to upload.");
            return;
        }
        setLoadingMessage('Creating voice model, please wait...');
        
        const formData = new FormData();
        formData.append('modelName', modelName);
        formData.append('language', language);
        formData.append('gender', gender);
        formData.append('mp3file', mp3File);

        try {
            const response = await fetch('http://localhost:8080/createvoice', {
                method: 'POST',
                body: formData,
            });
            const result = await response.text();
            setResultMessage(result);
        } catch (error) {
            console.error('Error creating voice model:', error);
            setResultMessage('An error occurred while creating the voice model.');
        } finally {
            setLoadingMessage('');
        }
    };

    const onStop = (recordedBlob) => {
        setRecordBlobLink(recordedBlob.blobURL);
        setIsRunning(false);
    };

    const startHandle = () => {
        setIsRunning(true);
    };

    const stopHandle = (mediaBlobUrl) => {
        setIsRunning(false);
        setRecordBlobLink(mediaBlobUrl);
    };

    const updateHandle = (mediaBlobUrl) => {
        setRecordBlobLink(mediaBlobUrl);
    };

    const handleSubmitRecording = async () => {
        if (!recordBlobLink) {
            alert('Please record audio first.');
            return;
        }
        setLoadingMessage('Creating voice model from recorded audio, please wait...');
        
        const formData = new FormData();
        formData.append('modelName', modelName);
        formData.append('language', language);
        formData.append('gender', gender);
        const recordedAudioBlob = await fetch(recordBlobLink).then((r) => r.blob());
        formData.append('mp3file', recordedAudioBlob, 'recorded-audio.ogg');

        try {
            const response = await fetch('http://localhost:8080/createvoice', {
                method: 'POST',
                body: formData,
            });
            const result = await response.text();
            setResultMessage(result);
        } catch (error) {
            console.error('Error uploading recorded audio:', error);
            setResultMessage('An error occurred while creating the voice model.');
        } finally {
            setLoadingMessage('');
        }
    };

    return (
        <div className="createmodel-page">
            <h1 className="page-title">Create Voice Model</h1>

            {!showRecordingSection ? (
                <>
                    <form className="upload-form" onSubmit={handleSubmitFile}>
                        <h2 className="form-title">Upload MP3 File to Create Voice Model</h2>
                        <label className="form-label">
                            Model Name:
                            <input
                                type="text"
                                value={modelName}
                                onChange={(e) => setModelName(e.target.value)}
                                required
                                className="text-input"
                            />
                        </label>
                        <br />
                        <label className="form-label">
                            Language:
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                required
                                className="select-input"
                            >
                                <option value="English">English</option>
                                <option value="Korean">Korean</option>
                                <option value="Chinese">Chinese</option>
                                <option value="Spanish">Spanish</option>
                            </select>
                        </label>
                        <br />
                        <label className="form-label">
                            Gender:
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="select-input"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </label>
                        <br />
                        <label className="form-label">
                            Upload MP3 File:
                            <input
                                type="file"
                                accept=".mp3,.ogg,.wav"
                                onChange={handleFileChange}
                                required
                                className="file-input"
                            />
                        </label>
                        <br />
                        <button type="submit" className="submit-button">Create Model</button>
                    </form>
                    <button onClick={() => setShowRecordingSection(true)} className="record-button">Record Your Own Voice</button>
                </>
            ) : (
                <>
                    <h2 className="form-title">Record Your Voice</h2>
                    <label className="form-label">
                        Model Name:
                        <input
                            type="text"
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            required
                            className="text-input"
                        />
                    </label>
                    <br />
                    <label className="form-label">
                        Language:
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            required
                            className="select-input"
                        >
                            <option value="English">English</option>
                            <option value="Korean">Korean</option>
                            <option value="Chinese">Chinese</option>
                            <option value="Spanish">Spanish</option>
                        </select>
                    </label>
                    <br />
                    <label className="form-label">
                        Gender:
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="select-input"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </label>
                    <br />
                    <ReactMediaRecorder
                        audio
                        onStop={onStop}
                        render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
                            <><p className="status-text">{status}</p>
                            <div className="record-section">
                                <div className='record-button-container'>
                                    <button onClick={() => { startHandle(); startRecording(); }} disabled={isRunning} className="start-button">
                                        Start Recording
                                    </button>
                                    <button onClick={() => { stopHandle(mediaBlobUrl); stopRecording(); }} disabled={!isRunning} className="stop-button">
                                        Stop Recording
                                    </button><br />
                                </div>
                                {mediaBlobUrl && <audio src={mediaBlobUrl} autoPlay controls className="audio-player"></audio>}
                                <br />
                                <div className='nav-button-container'>
                                    <button onClick={() => updateHandle(mediaBlobUrl)} disabled={!mediaBlobUrl} className="use-recording-button">Use this recording</button>
                                    <br />
                                    <button onClick={handleSubmitRecording} disabled={!recordBlobLink} className="submit-recording-button">Create Model from Recording</button>
                                </div>
                            </div>
                            </>
                        )}
                    />
                </>
            )} <br /><br />

            {loadingMessage && <p className="loading-message">{loadingMessage}</p>}
            {resultMessage && <div className="result-message" dangerouslySetInnerHTML={{ __html: resultMessage }} />}

            <button className="back-button" onClick={() => navigate('/speechtotext')}>Go Back</button>
        </div>
    );
}

export default CreatemodelPage;
