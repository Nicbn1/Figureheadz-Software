import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSendContactMessage } from "@workspace/api-client-react";

const contactSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  reason: z.string().min(1, "Select a reason for contacting us"),
  message: z.string().min(10, "Tell us a bit more (at least 10 characters)"),
});

type ContactValues = z.infer<typeof contactSchema>;

const REASONS = [
  { value: "order", label: "Order Question" },
  { value: "returns", label: "Returns & Refunds" },
  { value: "product", label: "Product Question" },
  { value: "wholesale", label: "Wholesale / Partnership" },
  { value: "other", label: "Something Else" },
];

export function ContactDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const sendContactMessage = useSendContactMessage();

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { email: "", reason: "", message: "" },
  });

  const onSubmit = async (values: ContactValues) => {
    try {
      await sendContactMessage.mutateAsync({ data: values });
      toast({
        title: "Message sent!",
        description: "Our crew will get back to you at " + values.email + " soon.",
      });
      form.reset();
      setOpen(false);
    } catch {
      toast({
        title: "Couldn't send your message",
        description: "Something went wrong. Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="bg-secondary text-black hover:bg-secondary/90"
        >
          Contact Us
        </Button>
      </DialogTrigger>
      <DialogContent className="comic-border sm:rounded-none">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl uppercase">Get In Touch</DialogTitle>
          <DialogDescription>
            Questions, order issues, or just want to say hi? Send us a message.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="hero@multiverse.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Contacting Us</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REASONS.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us what's going on..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto"
                disabled={sendContactMessage.isPending}
              >
                {sendContactMessage.isPending ? "Sending..." : "Send"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
