"use client";

import styles from "@/styles/login.module.css";
import TextInput from "@/app/components/ui/TextInput";
import PrimaryButton from "@/app/components/ui/PrimaryButton";
import { useLogin } from "../hooks/useLogin";

export default function LoginForm() {
  const { identifier, setIdentifier, password, setPassword, loading, error, canSubmit, submit } =
    useLogin();

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.title}>Sign in first!</div>

        <TextInput
          className={styles.input}
          placeholder="Username atau Email"
          value={identifier}
          onChange={setIdentifier}
          autoComplete="username"
        />


      <TextInput
        className={styles.input}
        placeholder="Password"
        type="password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
      />

      {error ? <div className={styles.error}>{error}</div> : null}

      <PrimaryButton className={styles.button} type="submit" disabled={!canSubmit}>
        {loading ? "..." : "Enter"}
      </PrimaryButton>
    </form>
  );
}