import { useSearch } from "wouter";
import { SignIn } from "@clerk/react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function SignInPage() {
  const search = useSearch();
  const redirect = new URLSearchParams(search).get("redirect");

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-12">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        forceRedirectUrl={redirect || `${basePath}/account`}
      />
    </div>
  );
}
