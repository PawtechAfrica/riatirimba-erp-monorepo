# File Upload API


POST `/api/upload`

---

## **Request**

**Content-Type:** `multipart/form-data`

| Key       | Value (Example) |
|-----------|-----------------|
| passport  | passport.jpg    |

You can replace `passport` with the appropriate field name your API expects (e.g., `birth`, `id_card`, etc.).

---

## **Response**

**Status:** `200 OK`

```json
{
    "message": "Files stored locally and indexed in DB",
    "files": [
        {
            "field": "birth",
            "file": {
                "id": 5,
                "originalName": "RTI-Memo.pdf",
                "fieldName": "birth",
                "storagePath": "D:\\work\\2025\\ERP\\RIATIRIMBA-ERP\\file_gate\\uploads\\1ee60469-957b-47e7-88fb-fc75416b9bba-RTI-Memo.pdf",
                "mimeType": "application/pdf",
                "size": 431750,
                "status": "pending",
                "updatedAt": "2025-08-11T22:52:21.195Z",
                "createdAt": "2025-08-11T22:52:21.195Z"
            },
            "b2FileName": "1ee60469-957b-47e7-88fb-fc75416b9bba-RTI-Memo.pdf"
        }
    ]
}


## ⚠️ Error Responses

---

### **1️⃣ Missing File**
**Status Code:** `400 Bad Request`

```json
{
  "error": "No files uploaded"
}



## **2️⃣ Database Save Error**
Status Code: 500 Internal Server Error

```json
{
  "error": "Database connection failed"
}



# VIEW FILES

GET `/api/files/:fileName`

Response

{
  "url": "https://s3.us-west-004.backblazeb2.com/Riatirimba/2c55b332-8376-4202-adb2-89d669219a01-nationalId.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=0044b2a603cbcde0000000001%2F20250814%2Fus-west-002%2Fs3%2Faws4_request&X-Amz-Date=20250814T163607Z&X-Amz-Expires=600&X-Amz-Signature=8b64248a62f07b2965fcb75085f19785dca3eef3797f5dafb488b493e2d74996&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"
}



# File Deletion API (Backblaze B2)

This API deletes a file from Backblaze B2 storage using the file's **bucketId** and **fileName**.

## Base URL


---

## Endpoint

### **POST** `/api/delete_file`
Deletes a file from Backblaze B2.

#### **Request Body**
```json
{
    "b2FileName":"75599f4b-e2d0-4254-82f3-905b681cfafe-nationalId.pdf"
}

Success Response
Status Code: 200 OK

{
    "data": {
        "fileId": "4_z74dbe2da76b0933c9b8c0d1e_f102b055afd25ddc8_d20250812_m092848_c004_v0402019_t0047_u01754990928415",
        "fileName": "7228440a-a1df-448f-bc56-084b2cca5b76-RTI-Memo.pdf"
    }
}

#### **Error if trying to delete an unavilable file**
Response
{
    "error": "File not found"
}