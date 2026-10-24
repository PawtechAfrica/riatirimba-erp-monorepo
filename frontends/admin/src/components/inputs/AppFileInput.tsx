// import React, {useState} from "react";
// import {FileInput, type FileInputProps} from "@mantine/core";
// import {fileSizeValidator} from "@/libs/utils.ts";
//
// interface props extends FileInputProps {
//     withCrop: boolean;
//     maxSize?: number;
// }
//
// export default function AppFileInput({withCrop, maxSize, ...rest}: props) {
//     const [editing, setEditing] = useState<boolean>(false)
//     const [file, setFile] = useState<File | null>(null)
//
//     const handleChange = async (input: File | null) => {
//         if (!input) return setFile(null)
//         try {
//             const result = fileSizeValidator(maxSize ?? 5)
//             result()
//         } catch (err) {
//
//         }
//     }
//     return (
//         <div>
//             {editing
//                 ? <FileInput
//                     {...rest}
//                     value={file}
//                     onChange={handleChange}
//                 />
//                 : <div></div>
//             }
//         </div>
//     )
// }
//
//
