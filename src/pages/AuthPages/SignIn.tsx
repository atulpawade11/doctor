import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign In | Mann Ka Doctor Admin Dashboard"
        description="Sign in to your Mann Ka Doctor Admin Dashboard account to access your profile, manage data, and use admin features."
      />

      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
