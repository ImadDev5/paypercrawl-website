"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  coverLetter: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CareerApplicationForm(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  position: string;
  jobId?: string;
}) {
  const { open, onOpenChange, position, jobId } = props;
  const [submitting, setSubmitting] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true);
      if (!resume) { setResumeError('Resume is required'); setSubmitting(false); return; }
      if (resume.type !== 'application/pdf') { setResumeError('PDF only'); setSubmitting(false); return; }
      if (resume.size > 5 * 1024 * 1024) { setResumeError('Max 5MB'); setSubmitting(false); return; }
      setResumeError(null);

      const ab = await resume.arrayBuffer();
      // ArrayBuffer to base64 without Node Buffer
      let binary = '';
      const bytes = new Uint8Array(ab);
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);
      const res = await fetch("/api/applications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          website: data.website || undefined,
          coverLetter: data.coverLetter,
          position,
          jobId,
          resume: {
            filename: resume.name,
            mimeType: resume.type,
            size: resume.size,
            base64,
          },
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to submit");
      reset();
      setResume(null);
      onOpenChange(false);
      // naive toast alternative
      alert("Application submitted. Check your email for confirmation.");
    } catch (e: any) {
      alert(e.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply for {position}</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input {...register("name")} />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message as string}</p>}
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message as string}</p>}
            </div>
            <div>
              <Label>Phone</Label>
              <Input {...register("phone")} />
            </div>
            <div>
              <Label>Website / LinkedIn</Label>
              <Input placeholder="https://" {...register("website")} />
            </div>
          </div>

          <div>
            <Label>Cover Letter</Label>
            <Textarea rows={4} placeholder="Optional" {...register("coverLetter")} />
          </div>

          <div>
            <Label>Resume (PDF only, max 5MB)</Label>
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setResume(f);
                setResumeError(null);
              }}
            />
            {resumeError && <p className="text-sm text-red-600">{resumeError}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="disabled:opacity-100 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed dark:disabled:bg-slate-800 dark:disabled:text-slate-400">{submitting ? "Submitting…" : "Submit Application"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CareerApplicationForm;
