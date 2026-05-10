import React, { useMemo, useState } from "react";
import { Mail, MessageCircle, Send } from "lucide-react";

interface PublicContactSectionProps {
  emailTo: string;
  whatsappNumber: string;
  title?: string;
  subtitle?: string;
}

const PublicContactSection: React.FC<PublicContactSectionProps> = ({
  emailTo,
  whatsappNumber,
  title = "Contact",
  subtitle = "Send your details and message. You can contact directly on WhatsApp or Email.",
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const composedMessage = useMemo(
    () =>
      `Name: ${name || "N/A"}\nEmail: ${email || "N/A"}\n\nMessage:\n${message || "N/A"}`,
    [name, email, message],
  );

  const whatsappHref = useMemo(() => {
    const normalized = whatsappNumber.replace(/[^\d]/g, "");
    return `https://wa.me/${normalized}?text=${encodeURIComponent(composedMessage)}`;
  }, [whatsappNumber, composedMessage]);

  const mailHref = useMemo(() => {
    const subject = `New inquiry from ${name || "website visitor"}`;
    return `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(composedMessage)}`;
  }, [emailTo, name, composedMessage]);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-white">{title}</h2>
      <p className="mt-2 text-sm text-gray-400">{subtitle}</p>

      <div className="mt-6 grid gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-700/70 bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/60"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1.5">Your Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-700/70 bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/60"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1.5">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full rounded-xl border border-gray-700/70 bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/60"
            placeholder="Type your message"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
        >
          <MessageCircle size={16} />
          Message on WhatsApp
        </a>

        <a
          href={mailHref}
          className="inline-flex items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-2.5 text-sm font-semibold text-blue-300 hover:bg-blue-500/20 transition-colors"
        >
          <Mail size={16} />
          Send Email
        </a>

        <a
          href={mailHref}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-gray-200 hover:bg-white/[0.06] transition-colors"
        >
          <Send size={16} />
          Quick Send
        </a>
      </div>
    </section>
  );
};

export default PublicContactSection;
