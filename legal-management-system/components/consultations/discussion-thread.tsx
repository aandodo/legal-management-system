"use client";

import { useState } from "react";
import { Paperclip, Scale, SendHorizonal, User } from "lucide-react";
import { toast } from "sonner";

import { FilePicker } from "@/components/shared/file-picker";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { ROLE_LABEL } from "@/lib/constants";
import { cn, formatDateTime, getInitials } from "@/lib/utils";
import type {
  Attachment,
  DiscussionMessage,
  Role,
} from "@/lib/types";

export function DiscussionThread({
  consultationId,
  initialMessages,
}: {
  consultationId: string;
  initialMessages: DiscussionMessage[];
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DiscussionMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!draft.trim() && !attachment) {
      toast.warning("Tulis pesan atau lampirkan berkas terlebih dahulu");
      return;
    }
    setSending(true);

    const optimistic: DiscussionMessage = {
      id: `DIS-TEMP-${Date.now()}`,
      consultation_id: consultationId,
      user_id: user?.id ?? "",
      author_name: user?.name ?? "Anda",
      author_role: (user?.role ?? "STAFF") as Role,
      message: draft.trim(),
      attachment,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");
    setAttachment(null);

    try {
      const res = await api.sendDiscussion(consultationId, {
        user_id: optimistic.user_id,
        author_name: optimistic.author_name,
        author_role: optimistic.author_role,
        message: optimistic.message,
        attachment: optimistic.attachment,
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? res : m))
      );
    } catch {
      toast.error("Pesan gagal terkirim", {
        description: "Pesan tetap tampil lokal. Muat ulang halaman untuk sinkron.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base">Diskusi</CardTitle>
        <span className="text-xs text-slate-400">
          {messages.length} pesan
        </span>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {messages.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-500">
              Belum ada pesan. Mulai diskusi dengan mengirim pesan pertama.
            </p>
          )}

          {messages.map((msg) => {
            const fromLegal = msg.author_role === "LEGAL_ADMIN";
            const mine = user?.id === msg.user_id;
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-3",
                  fromLegal && "flex-row-reverse"
                )}
              >
                <Avatar
                  className={cn(
                    "h-9 w-9 border",
                    fromLegal
                      ? "border-blue-200 bg-blue-100 text-blue-700"
                      : "border-slate-200 bg-slate-100 text-slate-600"
                  )}
                >
                  <AvatarFallback className="bg-transparent">
                    {getInitials(msg.author_name)}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={cn(
                    "max-w-[85%] space-y-1.5 rounded-2xl px-4 py-3",
                    fromLegal
                      ? "rounded-tr-sm bg-blue-600 text-white"
                      : "rounded-tl-sm bg-slate-100 text-slate-800"
                  )}
                >
                  <div
                    className={cn(
                      "flex flex-wrap items-center gap-2 text-xs",
                      fromLegal ? "text-blue-100" : "text-slate-500"
                    )}
                  >
                    <span className="flex items-center gap-1 font-semibold">
                      {fromLegal && <Scale className="h-3 w-3" />}
                      {msg.author_name}
                      {mine && " (Anda)"}
                    </span>
                    <Badge
                      variant={fromLegal ? "outline" : "secondary"}
                      className={cn(
                        "h-5 px-1.5 text-[10px]",
                        fromLegal &&
                          "border-blue-300 bg-blue-500/20 text-blue-50"
                      )}
                    >
                      {ROLE_LABEL[msg.author_role]}
                    </Badge>
                    <span className="ml-auto">
                      {formatDateTime(msg.created_at)}
                    </span>
                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.message}
                  </p>

                  {msg.attachment && (
                    <div className="pt-1">
                      <div
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
                          fromLegal ? "bg-white/10" : "bg-white"
                        )}
                      >
                        <Paperclip className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate font-medium">
                          {msg.attachment.name}
                        </span>
                        <span className="opacity-70">
                          ({msg.attachment.size})
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Composer */}
        <div className="mt-6 rounded-xl border bg-slate-50/60 p-3">
          {(pickerOpen || attachment) && (
            <div className="mb-3">
              <FilePicker
                value={attachment}
                onChange={(f) => {
                  setAttachment(f);
                  setPickerOpen(false);
                }}
                compact
              />
            </div>
          )}
          <div className="flex items-end gap-2">
            <textarea
              rows={2}
              placeholder="Tulis pesan... (Enter untuk kirim)"
              className="min-h-11 flex-1 resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!sending) void send();
                }
              }}
            />
            <div className="flex flex-col gap-2">
              {!attachment && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setPickerOpen((o) => !o)}
                  aria-label="Lampirkan berkas"
                >
                  <Paperclip />
                </Button>
              )}
              <Button
                size="icon"
                className="h-10 w-10"
                onClick={() => void send()}
                disabled={sending}
                aria-label="Kirim pesan"
              >
                <SendHorizonal />
              </Button>
            </div>
          </div>
          <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
            <User className="h-3 w-3" />
            Pesan terkirim sebagai {user?.name} — {user ? ROLE_LABEL[user.role as Role] : ""}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
