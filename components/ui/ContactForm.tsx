"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { messageApi } from "@/lib/api";

export default function ContactForm({ cms }: { cms?: unknown }) {
  const [formData, setFormData] = useState({ name: "", contact: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact || !formData.message) {
      return toast.error("Please fill in all fields");
    }

    try {
      setLoading(true);
      await messageApi.create(formData);
      toast.success("Message sent successfully! We will get back to you soon.");
      setFormData({ name: "", contact: "", message: "" });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="rpt-form" onSubmit={handleSubmit}>
      <div className="rpt-form-group">
        <label className="rpt-form-label">Your Name</label>
        <input 
          className="rpt-input" 
          placeholder="Ram Sharma" 
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={loading}
        />
      </div>
      <div className="rpt-form-group">
        <label className="rpt-form-label">Email or Phone</label>
        <input 
          className="rpt-input" 
          placeholder="your@email.com" 
          value={formData.contact}
          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          disabled={loading}
        />
      </div>
      <div className="rpt-form-group">
        <label className="rpt-form-label">Message</label>
        <textarea
          rows={4}
          className="rpt-input rpt-input--textarea"
          placeholder="Ask about our products or pricing..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          disabled={loading}
        />
      </div>
      <button 
        type="submit" 
        className="rpt-btn-primary rpt-btn--full flex justify-center items-center gap-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            Sending...
          </>
        ) : "Send Message"}
      </button>
    </form>
  );
}
