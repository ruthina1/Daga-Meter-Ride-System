import React, { useState } from 'react';
import '../styles/SignUp.css';


function SignUp({ setActiveComponent, onVisibilityChange, isVisible }) {
    const [form, setForm] = useState({
        username: '',
        countryCode: '+251',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        // Add sign up logic here (e.g., API call)
        alert('Sign Up Successful!');
    };

    const handleSignIn = () => {
    if (setActiveComponent) {
      setActiveComponent("signin");   
    }
    if (onVisibilityChange) {
      onVisibilityChange(false);
    }
  };


    return (
        <form className="signup-form" onSubmit={handleSubmit}>
            <h1>Sign Up</h1>
            <p>
           Already have an account? {' '}
            <span className="sign-up-link" onClick={handleSignIn}> Sign in </span>
             here.
          </p>
            <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
            />
        
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <select
                    name="countryCode"
                    value={form.countryCode}
                    onChange={handleChange}
                    style={{ width: '100px', marginRight: '8px' }}
                >
                    <option value="+251">+251</option>
                    <option value="+1">+1 </option>
                    <option value="+44">+44</option>
                    <option value="+91">+91</option>
                    <option value= "+81">+81</option>
                    <option value="+49">+49 </option>
                    <option value="+33">+33</option>
                    <option value="+39">+39</option>
                    <option value="+7">+7</option>
                    <option value="+61">+61</option>
                    <option value="+55">+55</option>
                    <option value="+82">+82</option>
                    <option value="+34">+34</option>
                    <option value="+46">+46</option>
                    <option value="+27">+27</option>

                </select>
                <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                    pattern="[0-9]{9,15}"
                    required
                    style={{ flex: 1 }}
                />
            </div>
            
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
            />
            
            <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
            />
           <div className='privacy'>
             <input type="checkbox" />
              <label>
                  By signing up, you agree to the Terms of Service and Privacy Policy.
                 </label>
</div>

            
            <button type="submit">Sign Up</button>

           
        </form>
    );
}

export default SignUp;