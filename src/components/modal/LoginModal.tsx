"use client";
import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/ui/dialog";

export const LoginModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogTitle>Login</DialogTitle>
      <form className="space-y-4">
        <input type="email" placeholder="Email" className="w-full border px-4 py-2 rounded" />
        <input type="password" placeholder="Password" className="w-full border px-4 py-2 rounded" />
        <button className="w-full bg-yellow-500 text-white py-2 rounded">Login</button>
      </form>
    </DialogContent>
  </Dialog>
);