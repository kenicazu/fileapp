import * as React from "react";
import { useDropzone } from "react-dropzone";
import "core-js/modules/es.array.from";

interface DropZoneProps {
    myFiles: File[],
    setMyFiles: React.Dispatch<React.SetStateAction<File[]>>,
}

const DropZone: React.FC<DropZoneProps> = (props) => {
    const myFiles = props.myFiles;
    const setMyFiles = props.setMyFiles;
  
    const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
        setMyFiles([...myFiles, ...acceptedFiles]);
    },
    [myFiles]
    );

    const { getRootProps, getInputProps, inputRef } = useDropzone({
        noKeyboard: true,
        maxSize: 20971520,
        multiple: false,
        onDrop
    });

    const handleRemoveFile = React.useCallback(
        (fileName: string) => {
        const dt = new DataTransfer();
        const files = Array.from(inputRef!.current!.files!);

        // Add selected fiels to DataTransfer object
        for (let file of files) {
            file.name !== fileName && dt.items.add(file); // Add only file name not matched files
        }

        inputRef!.current!.files = dt.files; // Overwrite files
        setMyFiles(Array.from(dt.files)); // Set states to render file list
        },
        [inputRef]
    );

    const files = React.useMemo(
        () =>
        myFiles.map((file: File) => (
            <p key={file.name}>
            {file.name} ({file.size} bytes)
            <button
                className={"material-icons delete"}
                onClick={() => handleRemoveFile(file.name)}
            >
                Remove file
            </button>
            </p>
        )),
        [handleRemoveFile, myFiles]
    );

    return (
        <section className="container">
        <div {...getRootProps({ className: "dropzone" })}>
            <input {...getInputProps()} />
            <p>ファイルをドラッグ&ドロップするか、クリックしてファイルを選択してください。</p>
        </div>
        {files.length > 0 ? (
            <div>
            <h4>Files</h4>
            <div>{files}</div>
            </div>
        ) : (
            ""
        )}
        </section>
    );
};

export default DropZone;
