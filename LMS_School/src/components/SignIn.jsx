import React from "react";

const SignIn = () => {
  return (
    <section className="page-section">
      <h2>Sign In</h2>
      <form className="signin-form">
        <input type="email" placeholder="Email Address" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Sign In</button>
      </form>
    </section>
  );
};

export default SignIn;
