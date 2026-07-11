import { useSearch } from "wouter";
import { SignUp } from "@clerk/react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function SignUpPage() {
  const search = useSearch();
  const redirect = new URLSearchParams(search).get("redirect");

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-12">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        forceRedirectUrl={redirect || `${basePath}/account`}
      />
    </div>
  );
}
