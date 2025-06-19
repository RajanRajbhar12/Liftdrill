import { submitVideo } from "@/lib/actions"
import { redirect } from "next/navigation"

interface Props {
  params: Promise<{ id: string }>
}

export default async function SubmitPage({ params }: Props) {
  const { id } = await params;

  async function handleSubmit(formData: FormData) {
    'use server';
    formData.append("challengeId", id);
    formData.append("score", "0");
    const result = await submitVideo(formData);
    if (result.success) {
      redirect(`/challenges/${id}`);
    }
    // Optionally handle error (e.g., show error page or message)
  }

  return (
    <div className="container max-w-2xl py-8">
      <form action={handleSubmit} className="space-y-6">
        <h1 className="text-2xl font-bold mb-6">Submit Your Video</h1>
        <div className="space-y-2">
          <label htmlFor="video">Video File</label>
          <input
            id="video"
            name="video"
            type="file"
            accept="video/*"
            required
          />
          <p className="text-sm text-muted-foreground">
            Maximum file size: 10MB. Supported formats: MP4, MOV, AVI
          </p>
        </div>
        <div className="space-y-2">
          <label htmlFor="notes">Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            placeholder="Add any notes about your submission..."
          />
        </div>
        <button type="submit" className="w-full">
          Submit Video
        </button>
      </form>
    </div>
  );
} 