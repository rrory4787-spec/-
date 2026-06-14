/**
 * Helper utility to manage backup and transfer of posts/media to Google Drive.
 */

interface GoogleDriveFolder {
  id: string;
  name: string;
}

// Check if a folder exists, and create it if not
export async function getOrCreateFolder(accessToken: string, folderName: string): Promise<string> {
  try {
    const listUrl = `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(folderName)}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const checkRes = await fetch(listUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (checkRes.ok) {
      const data = await checkRes.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }

    // Not found, create it
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      })
    });

    if (!createRes.ok) {
      throw new Error(`Failed to create folder on Drive: ${createRes.statusText}`);
    }

    const folder = await createRes.json();
    return folder.id;
  } catch (error) {
    console.error('Error in getOrCreateFolder:', error);
    throw error;
  }
}

// Convert base64 data to binary bytes for Google Drive multipart upload
function base64ToBlob(base64Url: string): { blob: Blob; mimeType: string } {
  const parts = base64Url.split(';base64,');
  const mimeType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return {
    blob: new Blob([uInt8Array], { type: mimeType }),
    mimeType
  };
}

// Upload file to Google Drive under a specific folder
export async function uploadFileToDrive(
  accessToken: string,
  folderId: string,
  fileName: string,
  mimeType: string,
  dataUrlOrText: string,
  isBase64: boolean = false
): Promise<string> {
  try {
    let contentBlob: Blob;
    let actualMime = mimeType;

    if (isBase64) {
      const parsed = base64ToBlob(dataUrlOrText);
      contentBlob = parsed.blob;
      actualMime = parsed.mimeType;
    } else {
      contentBlob = new Blob([dataUrlOrText], { type: mimeType });
    }

    // we construct a multipart upload request
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delim = `\r\n--${boundary}--`;

    const metadata = {
      name: fileName,
      mimeType: actualMime,
      parents: [folderId]
    };

    // Read blob as binary string or array buffer to construct the body safely
    const reader = new FileReader();
    const arrayBufferPromise = new Promise<ArrayBuffer>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(contentBlob);
    });

    const fileDataBytes = await arrayBufferPromise;
    
    // Construct request body with metadata + multipart media contents
    const encoder = new TextEncoder();
    const header = encoder.encode(
      `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}${delimiter}Content-Type: ${actualMime}\r\n\r\n`
    );
    const footer = encoder.encode(`\r\n${close_delim}`);

    // Merge bytes
    const totalLength = header.byteLength + fileDataBytes.byteLength + footer.byteLength;
    const bodyBuffer = new Uint8Array(totalLength);
    bodyBuffer.set(header, 0);
    bodyBuffer.set(new Uint8Array(fileDataBytes), header.byteLength);
    bodyBuffer.set(footer, header.byteLength + fileDataBytes.byteLength);

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: bodyBuffer
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google Drive upload failed: ${res.statusText} (${errText})`);
    }

    const fileResponse = await res.json();
    return fileResponse.id;
  } catch (error) {
    console.error('Error uploading file to Drive:', error);
    throw error;
  }
}

// Primary entry point for backing up a post completely to Google Drive
export async function backupPostToGoogleDrive(
  accessToken: string,
  post: {
    content: string;
    category?: string;
    authorName?: string;
    authorEmail?: string;
    imageUrl?: string;
    videoUrl?: string;
  }
): Promise<{ success: boolean; driveFileIds: string[]; folderId?: string }> {
  try {
    const folderId = await getOrCreateFolder(accessToken, 'أرشيف خزائن الأرض - Khazain Al-Ard Archive');
    const driveFileIds: string[] = [];

    // 1. Prepare and upload the Post's text description as a document
    const textFileName = `منشور_بواسطة_${post.authorName || 'عضو'}_${Date.now()}.txt`;
    const postDetailsText = `أرشيف خزائن الأرض
---------------------
الناشر: ${post.authorName || 'غير معروف'} (${post.authorEmail || ''})
تاريخ النشر والأرشفة: ${new Date().toLocaleString('ar-EG')}
التصنيف: ${post.category || 'العام'}

محتوى المنشور:
${post.content}
`;

    const textPostId = await uploadFileToDrive(
      accessToken,
      folderId,
      textFileName,
      'text/plain;charset=UTF-8',
      postDetailsText,
      false
    );
    driveFileIds.push(textPostId);

    // 2. If an image attachment exists, upload it to Google Drive
    if (post.imageUrl && post.imageUrl.startsWith('data:image/')) {
      const ext = post.imageUrl.split(';')[0].split('/')[1] || 'png';
      const imgFileName = `مرفق_صورة_${Date.now()}.${ext}`;
      const imgFileId = await uploadFileToDrive(
        accessToken,
        folderId,
        imgFileName,
        'image/png', // Will be overridden dynamically by base64 mime type
        post.imageUrl,
        true
      );
      driveFileIds.push(imgFileId);
    }

    // 3. If a video attachment exists, upload it to Google Drive
    if (post.videoUrl && post.videoUrl.startsWith('data:')) {
      const parts = post.videoUrl.split(';')[0];
      const ext = parts.includes('/') ? parts.split('/')[1] : 'mp4';
      const vidFileName = `مرفق_فيديو_${Date.now()}.${ext}`;
      const vidFileId = await uploadFileToDrive(
        accessToken,
        folderId,
        vidFileName,
        'video/mp4', // Will be overridden dynamically by base64 mime type
        post.videoUrl,
        true
      );
      driveFileIds.push(vidFileId);
    }

    return { success: true, driveFileIds, folderId };
  } catch (err) {
    console.error('Failed to backup post to Google Drive:', err);
    return { success: false, driveFileIds: [] };
  }
}
