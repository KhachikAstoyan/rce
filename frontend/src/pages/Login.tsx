import { Link } from "@tanstack/react-router";

import { FaGoogle } from "react-icons/fa";
import { useCallback } from "react";
import { getGoogleAuthUrl } from "@/lib/api";
import { DefaultLayout } from "@/layouts/DefaultLayout";
import { Button, Card, Text, Title } from "@mantine/core";

export function LoginForm() {
  const handleGoogleLogin = useCallback(() => {
    window.location.href = getGoogleAuthUrl();
  }, []);

  return (
    <DefaultLayout>
      <Card
        padding="lg"
        radius="md"
        withBorder
        className="mx-auto max-w-sm p-5"
      >
        <Title order={2}>Login</Title>
        <Text>Enter your email below to login to your account</Text>
        <div className="grid gap-4 mt-5">
          <Button
            variant="filled"
            color="blue"
            type="submit"
            className="w-full"
          >
            Login
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
          >
            <FaGoogle className="mr-2" />
            Login with Google
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </Card>
    </DefaultLayout>
  );
}
