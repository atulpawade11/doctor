import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Sign Up | Mann Ka Doctor Admin Dashboard"
        description="Create a new account in the Mann Ka Doctor Admin Dashboard to manage your profile, access features, and perform administrative tasks."
      />

      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
