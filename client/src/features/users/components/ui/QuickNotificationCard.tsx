import { useState } from "react"
import { Send } from "lucide-react"
import { toast } from "sonner"

interface QuickNotificationCardProps {
  userEmail: string
  userName: string
}

export default function QuickNotificationCard({ userEmail, userName }: QuickNotificationCardProps) {
  const [notification, setNotification] = useState({
    type: "Account Alert",
    subject: "",
    content: "",
  })

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault()
    if (!notification.subject || !notification.content) {
      toast.warning("Please fill in both subject and message content.")
      return
    }
    toast.success(`Notification of type "${notification.type}" sent to ${userName || userEmail}!`)
    setNotification((prev) => ({ ...prev, subject: "", content: "" }))
  }

  return (
    <div
      id="quick-notification-form"
      className="border border-border bg-card/60 backdrop-blur-md rounded-3xl p-5 xl:p-6 shadow-xl space-y-5 text-left"
    >
      <div className="flex items-center gap-2">
        <Send size={16} className="text-primary" />
        <h2 className="text-base font-black uppercase text-foreground tracking-widest">
          Quick Notification
        </h2>
      </div>

      <form onSubmit={handleSendNotification} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
            Notification Type
          </label>
          <select
            value={notification.type}
            onChange={(e) => setNotification((prev) => ({ ...prev, type: e.target.value }))}
            className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
          >
            <option value="Account Alert" className="bg-card text-foreground">Account Alert</option>
            <option value="Promotional" className="bg-card text-foreground">Promotional Offer</option>
            <option value="Maintenance" className="bg-card text-foreground">System Maintenance</option>
            <option value="Warning" className="bg-card text-foreground">Policy Warning</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
            Subject
          </label>
          <input
            type="text"
            placeholder="Enter message subject..."
            value={notification.subject}
            onChange={(e) => setNotification((prev) => ({ ...prev, subject: e.target.value }))}
            className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
            Message Content
          </label>
          <textarea
            rows={4}
            placeholder="Type your message here..."
            value={notification.content}
            onChange={(e) => setNotification((prev) => ({ ...prev, content: e.target.value }))}
            className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-black text-xs transition-all shadow-md shadow-primary/10 cursor-pointer"
        >
          <Send size={13} />
          <span>Send Message</span>
        </button>
      </form>
    </div>
  )
}
