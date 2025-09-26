import { Media, MediaStore, MediaUploadOptions, MediaListOptions } from "tinacms";

export class AzureMediaStore implements MediaStore {
  accept = "image/*";

  private getUploadUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_AZURE_FUNCTION_BASE_URL || "https://hikingimagestorage-cafpa4h7abfwhhar.westus-01.azurewebsites.net";
    const code = process.env.NEXT_PUBLIC_AZURE_UPLOAD_FUNCTION_CODE;
    if (!code) {
      throw new Error("NEXT_PUBLIC_AZURE_UPLOAD_FUNCTION_CODE environment variable is required");
    }
    return `${baseUrl}/api/uploadimage?code=${code}`;
  }

  async persist(files: MediaUploadOptions[]): Promise<Media[]> {
    const uploads = await Promise.all(
      files.map(async (uploadOptions) => {
        try {
          const formData = new FormData();
          formData.append("file", uploadOptions.file);

          const res = await fetch(this.getUploadUrl(), {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
          }

          const { id, src } = await res.json();
          
          if (!src) {
            throw new Error("No URL returned from Azure storage");
          }

          const fullSrc = this.toFullUrl(src);

          return {
            type: "file" as const,
            id: id,
            filename: id,
            directory: uploadOptions.directory || "/",
            src: fullSrc,
            thumbnails: {
                "75x75": fullSrc,
                "400x400": fullSrc,
                "1000x1000": fullSrc
            },
          };
        } catch (error) {
          console.error("Failed to upload to Azure:", error);
          throw error;
        }
      })
    );
    return uploads;
  }

  toFullUrl = (src: string): string => {
    const storageUrl = process.env.NEXT_PUBLIC_AZURE_BLOB_BASE_URL || "https://hikingimagestorage.blob.core.windows.net";
    return `${storageUrl}/images/${src}`;
  }

  private getListUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_AZURE_FUNCTION_BASE_URL || "https://hikingimagestorage-cafpa4h7abfwhhar.westus-01.azurewebsites.net";
    const code = process.env.NEXT_PUBLIC_AZURE_LIST_FUNCTION_CODE;
    if (!code) {
      throw new Error("NEXT_PUBLIC_AZURE_LIST_FUNCTION_CODE environment variable is required");
    }
    return `${baseUrl}/api/listimages?code=${code}`;
  }

  async list(options?: MediaListOptions): Promise<{items: Media[], offset: number}> {
    const res = await fetch(this.getListUrl());
    const data = await res.json();

    const items = data.items.map((item: any) => ({
        ...item,
        src: this.toFullUrl(item.src), // Convert to full URL
        thumbnails: {
            "75x75": this.toFullUrl(item.src),
            "400x400": this.toFullUrl(item.src),
            "1000x1000": this.toFullUrl(item.src)
        }
    }));

    return {
      items: items,
      offset: data.offset || 0,
    };
  }

  // Needed so that it can be inserted into markdown!
  parse = (img: Media) => {
    return img.src;
  }

  private getDeleteUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_AZURE_FUNCTION_BASE_URL || "https://hikingimagestorage-cafpa4h7abfwhhar.westus-01.azurewebsites.net";
    const code = process.env.NEXT_PUBLIC_AZURE_DELETE_FUNCTION_CODE;
    if (!code) {
      throw new Error("NEXT_PUBLIC_AZURE_DELETE_FUNCTION_CODE environment variable is required");
    }
    return `${baseUrl}/api/deleteimage?code=${code}`;
  }

  async delete(media: Media) {
    await fetch(this.getDeleteUrl(), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: media.filename }),
    });
  }
}