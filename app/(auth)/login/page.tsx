import styles from "@/styles/login.module.css";
import LoginCircle  from "@/app/features/login/components/LoginCircle";
import  LoginForm  from "@/app/features/login/components/LoginForm";

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <LoginCircle />

      <div className={styles.formWrap}>
        <div className={styles.formContainer}>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
