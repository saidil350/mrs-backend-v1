import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-[420px]">
        <CardHeader className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-primary">
            MRS CRM
          </p>
          <CardTitle className="text-2xl">Masuk ke dashboard</CardTitle>
          <CardDescription>
            Kelola lead website, follow up sales, dan pipeline dalam satu tempat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {params.error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Email atau password tidak sesuai.
              </AlertDescription>
            </Alert>
          )}
          <form action={loginAction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="admin@mrs.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Masuk
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
