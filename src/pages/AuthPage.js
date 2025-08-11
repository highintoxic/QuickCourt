import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

function AuthPage({ onBackToHome, onLoginSuccess }) {
	const { login, register, sendEmailOTP, verifyEmailOTP, loading } = useAuth();

	const [isLogin, setIsLogin] = useState(false);
	const [errors, setErrors] = useState({});
	const [successMessage, setSuccessMessage] = useState("");
	const [showEmailVerification, setShowEmailVerification] = useState(false);
	const [verificationEmail, setVerificationEmail] = useState("");
	const [verificationCode, setVerificationCode] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);

	// Signup form data
	const [signupData, setSignupData] = useState({
		userType: "USER", // Default to USER, can be changed to FACILITY_OWNER
		fullName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	// Login form data
	const [loginData, setLoginData] = useState({
		email: "",
		password: "",
		rememberMe: false,
	});

	// Handle signup form changes
	const handleSignupChange = (e) => {
		const { name, value } = e.target;
		setSignupData((prev) => ({
			...prev,
			[name]: value,
		}));
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	// Handle login form changes
	const handleLoginChange = (e) => {
		const { name, value, type, checked } = e.target;
		setLoginData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	// Handle verification code change
	const handleVerificationCodeChange = (e) => {
		setVerificationCode(e.target.value);
		if (errors.verificationCode) {
			setErrors((prev) => ({
				...prev,
				verificationCode: "",
			}));
		}
	};

	// Validation functions
	const validateEmail = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const validatePassword = (password) => {
		return password.length >= 8;
	};

	// Validate signup form
	const validateSignupForm = () => {
		const newErrors = {};

		if (!signupData.userType) {
			newErrors.userType = "Please select user type";
		}
		if (!signupData.fullName.trim()) {
			newErrors.fullName = "Full name is required";
		}
		if (!signupData.email) {
			newErrors.email = "Email is required";
		} else if (!validateEmail(signupData.email)) {
			newErrors.email = "Please enter a valid email";
		}
		if (!signupData.password) {
			newErrors.password = "Password is required";
		} else if (!validatePassword(signupData.password)) {
			newErrors.password = "Password must be at least 8 characters";
		}
		if (!signupData.confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (signupData.password !== signupData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		return newErrors;
	};

	// Validate login form
	const validateLoginForm = () => {
		const newErrors = {};

		if (!loginData.email) {
			newErrors.email = "Email is required";
		} else if (!validateEmail(loginData.email)) {
			newErrors.email = "Please enter a valid email";
		}
		if (!loginData.password) {
			newErrors.password = "Password is required";
		}

		return newErrors;
	};

	// Handle signup form submission
	const handleSignupSubmit = async (e) => {
		e.preventDefault();
		setSuccessMessage("");

		const formErrors = validateSignupForm();
		if (Object.keys(formErrors).length > 0) {
			setErrors(formErrors);
			return;
		}

		setErrors({});

		try {
			// Prepare registration data
			const registrationData = {
				fullName: signupData.fullName,
				email: signupData.email,
				password: signupData.password,
				role: signupData.userType,
			};

			console.log("Registering user:", registrationData);

			// Call register API
			const result = await register(registrationData);

			if (result.success) {
				// Registration successful - send email OTP for verification
				setVerificationEmail(signupData.email);
				setShowEmailVerification(true);
				setSuccessMessage(
					result.message || "Registration successful! Please verify your email."
				);

				// Send email OTP automatically
				const otpResult = await sendEmailOTP(signupData.email);
				if (otpResult.success) {
					setSuccessMessage(
						"Registration successful! A verification code has been sent to your email."
					);
				} else {
					setSuccessMessage(
						"Registration successful! Please try to verify your email."
					);
				}
			} else {
				// Registration failed
				if (result.errors && result.errors.length > 0) {
					const errorObj = {};
					result.errors.forEach((error) => {
						if (error.field) {
							errorObj[error.field] = error.message;
						}
					});
					setErrors(errorObj);
				} else {
					setErrors({
						submit: result.message || "Registration failed. Please try again.",
					});
				}
			}
		} catch (error) {
			console.error("Registration error:", error);
			setErrors({ submit: "Something went wrong. Please try again." });
		}
	};

	// Handle email verification
	const handleEmailVerification = async (e) => {
		e.preventDefault();

		if (!verificationCode) {
			setErrors({ verificationCode: "Please enter the verification code" });
			return;
		}

		if (verificationCode.length !== 6) {
			setErrors({ verificationCode: "Verification code must be 6 digits" });
			return;
		}

		setIsVerifying(true);
		setErrors({});

		try {
			console.log("Verifying email OTP:", {
				email: verificationEmail,
				otp: verificationCode,
			});

			const result = await verifyEmailOTP(verificationEmail, verificationCode);

			if (result.success) {
				// Verification successful
				setSuccessMessage(
					"Email verified successfully! Your account has been activated. You can now log in."
				);
				setShowEmailVerification(false);
				setIsLogin(true); // Switch to login form

				// Reset forms
				setSignupData({
					userType: "USER",
					fullName: "",
					email: "",
					password: "",
					confirmPassword: "",
				});
				setVerificationCode("");
			} else {
				setErrors({
					verificationCode:
						result.message || "Invalid verification code. Please try again.",
				});
			}
		} catch (error) {
			console.error("Email verification error:", error);
			setErrors({ verificationCode: "Verification failed. Please try again." });
		} finally {
			setIsVerifying(false);
		}
	};

	// Resend verification code
	const handleResendCode = async () => {
		try {
			const result = await sendEmailOTP(verificationEmail);

			if (result.success) {
				setSuccessMessage("New verification code sent to your email.");
				setErrors({});
			} else {
				setErrors({
					submit: result.message || "Failed to resend code. Please try again.",
				});
			}
		} catch (error) {
			console.error("Resend code error:", error);
			setErrors({ submit: "Failed to resend code. Please try again." });
		}
	};

	// Handle login form submission
	const handleLoginSubmit = async (e) => {
		e.preventDefault();
		setSuccessMessage("");

		const formErrors = validateLoginForm();
		if (Object.keys(formErrors).length > 0) {
			setErrors(formErrors);
			return;
		}

		setErrors({});

		try {
			console.log("Logging in user:", { email: loginData.email });

			const result = await login({
				email: loginData.email,
				password: loginData.password,
			});

			if (result.success) {
				setSuccessMessage("Login successful! Redirecting to dashboard...");

				// Reset form
				setLoginData({
					email: "",
					password: "",
					rememberMe: false,
				});

				// Call success callback after a short delay
				setTimeout(() => {
					if (onLoginSuccess) {
						onLoginSuccess();
					}
				}, 1500);
			} else {
				if (result.errors && result.errors.length > 0) {
					const errorObj = {};
					result.errors.forEach((error) => {
						if (error.field) {
							errorObj[error.field] = error.message;
						}
					});
					setErrors(errorObj);
				} else {
					setErrors({
						submit:
							result.message || "Login failed. Please check your credentials.",
					});
				}
			}
		} catch (error) {
			console.error("Login error:", error);
			setErrors({ submit: "Login failed. Please try again." });
		}
	};

	const toggleForm = () => {
		setIsLogin(!isLogin);
		setErrors({});
		setSuccessMessage("");
		setShowEmailVerification(false);
		setVerificationCode("");
	};

	// Go back to signup form from verification
	const goBackToSignup = () => {
		setShowEmailVerification(false);
		setVerificationCode("");
		setErrors({});
		setSuccessMessage("");
	};

	return (
		<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
			<div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8'>
				<div className='text-center mb-8'>
					<div className='flex items-center justify-center gap-2 mb-4'>
						<div className='w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center'>
							<div className='w-4 h-4 bg-white rounded-full'></div>
						</div>
						<span className='text-xl font-semibold text-gray-800'>
							QuickCourt
						</span>
					</div>
					<h2 className='text-2xl font-bold text-gray-900'>
						{isLogin ? "Welcome Back" : "Create Account"}
					</h2>
					<p className='text-gray-600 mt-2'>
						{isLogin ? "Sign in to your account" : "Join QuickCourt today"}
					</p>
				</div>

				{/* Success Message */}
				{successMessage && (
					<div className='mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm'>
						{successMessage}
					</div>
				)}

				{/* Error Message */}
				{errors.submit && (
					<div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
						{errors.submit}
					</div>
				)}

				{/* Email Verification Form */}
				{showEmailVerification ? (
					<div className='space-y-4'>
						<div className='text-center mb-6'>
							<div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
								<svg
									className='w-8 h-8 text-blue-600'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
									/>
								</svg>
							</div>
							<p className='text-sm text-gray-600 mb-4'>
								We've sent a 6-digit verification code to:
							</p>
							<p className='font-medium text-gray-800'>{verificationEmail}</p>
						</div>

						<form onSubmit={handleEmailVerification} className='space-y-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Verification Code:
								</label>
								<input
									type='text'
									value={verificationCode}
									onChange={handleVerificationCodeChange}
									placeholder='Enter 6-digit code'
									maxLength={6}
									className={`w-full px-3 py-2 border rounded-md text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500 ${
										errors.verificationCode
											? "border-red-500"
											: "border-gray-300"
									}`}
								/>
								{errors.verificationCode && (
									<p className='mt-1 text-sm text-red-600'>
										{errors.verificationCode}
									</p>
								)}
							</div>

							<button
								type='submit'
								disabled={isVerifying}
								className='w-full bg-slate-700 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
							>
								{isVerifying ? (
									<>
										<div className='spinner mr-2'></div>
										Verifying...
									</>
								) : (
									"Verify Email"
								)}
							</button>
						</form>

						<div className='text-center space-y-2'>
							<p className='text-sm text-gray-600'>Didn't receive the code?</p>
							<button
								type='button'
								onClick={handleResendCode}
								disabled={loading}
								className='text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50'
							>
								{loading ? "Sending..." : "Resend Code"}
							</button>
							<div>
								<button
									type='button'
									onClick={goBackToSignup}
									className='text-gray-600 hover:text-gray-700 font-medium text-sm'
								>
									← Back to Sign Up
								</button>
							</div>
						</div>
					</div>
				) : !isLogin ? (
					// Signup Form
					<form onSubmit={handleSignupSubmit} className='space-y-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Player / Facility Owner :
							</label>
							<select
								name='userType'
								value={signupData.userType}
								onChange={handleSignupChange}
								className={`w-full px-3 py-2 bg-gray-400/80 border-0 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
									errors.userType ? "ring-2 ring-red-500" : ""
								}`}
							>
								<option value=''>Select user type</option>
								<option value='USER'>Player</option>
								<option value='FACILITY_OWNER'>Facility Owner</option>
							</select>
							{errors.userType && (
								<p className='mt-1 text-sm text-red-600'>{errors.userType}</p>
							)}
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Full Name :
							</label>
							<input
								type='text'
								name='fullName'
								value={signupData.fullName}
								onChange={handleSignupChange}
								placeholder='Enter your full name'
								className={`w-full px-3 py-2 bg-gray-400/80 border-0 rounded text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
									errors.fullName ? "ring-2 ring-red-500" : ""
								}`}
							/>
							{errors.fullName && (
								<p className='mt-1 text-sm text-red-600'>{errors.fullName}</p>
							)}
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Email :
							</label>
							<input
								type='email'
								name='email'
								value={signupData.email}
								onChange={handleSignupChange}
								placeholder='Enter your email'
								className={`w-full px-3 py-2 bg-gray-400/80 border-0 rounded text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
									errors.email ? "ring-2 ring-red-500" : ""
								}`}
							/>
							{errors.email && (
								<p className='mt-1 text-sm text-red-600'>{errors.email}</p>
							)}
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Password :
							</label>
							<input
								type='password'
								name='password'
								value={signupData.password}
								onChange={handleSignupChange}
								placeholder='Enter your password'
								className={`w-full px-3 py-2 bg-gray-400/80 border-0 rounded text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
									errors.password ? "ring-2 ring-red-500" : ""
								}`}
							/>
							{errors.password && (
								<p className='mt-1 text-sm text-red-600'>{errors.password}</p>
							)}
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Confirm Password :
							</label>
							<input
								type='password'
								name='confirmPassword'
								value={signupData.confirmPassword}
								onChange={handleSignupChange}
								placeholder='Confirm your password'
								className={`w-full px-3 py-2 bg-gray-400/80 border-0 rounded text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
									errors.confirmPassword ? "ring-2 ring-red-500" : ""
								}`}
							/>
							{errors.confirmPassword && (
								<p className='mt-1 text-sm text-red-600'>
									{errors.confirmPassword}
								</p>
							)}
						</div>

						<button
							type='submit'
							disabled={loading}
							className='w-full bg-slate-700 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
						>
							{loading ? (
								<>
									<div className='spinner mr-2'></div>
									Creating Account...
								</>
							) : (
								"Create Account"
							)}
						</button>
					</form>
				) : (
					// Login Form
					<form onSubmit={handleLoginSubmit} className='space-y-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Email :
							</label>
							<input
								type='email'
								name='email'
								value={loginData.email}
								onChange={handleLoginChange}
								placeholder='Enter your email'
								className={`w-full px-3 py-2 bg-gray-400/80 border-0 rounded text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
									errors.email ? "ring-2 ring-red-500" : ""
								}`}
							/>
							{errors.email && (
								<p className='mt-1 text-sm text-red-600'>{errors.email}</p>
							)}
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Password :
							</label>
							<input
								type='password'
								name='password'
								value={loginData.password}
								onChange={handleLoginChange}
								placeholder='Enter your password'
								className={`w-full px-3 py-2 bg-gray-400/80 border-0 rounded text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
									errors.password ? "ring-2 ring-red-500" : ""
								}`}
							/>
							{errors.password && (
								<p className='mt-1 text-sm text-red-600'>{errors.password}</p>
							)}
						</div>

						<div className='flex items-center justify-between'>
							<div className='flex items-center'>
								<input
									id='rememberMe'
									name='rememberMe'
									type='checkbox'
									checked={loginData.rememberMe}
									onChange={handleLoginChange}
									className='h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded'
								/>
								<label
									htmlFor='rememberMe'
									className='ml-2 block text-sm text-gray-700'
								>
									Remember me
								</label>
							</div>
							<div className='text-sm'>
								<button
									type='button'
									className='text-blue-600 hover:text-blue-700 font-medium'
								>
									Forgot password?
								</button>
							</div>
						</div>

						<button
							type='submit'
							disabled={loading}
							className='w-full bg-slate-700 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded mt-6 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
						>
							{loading ? (
								<>
									<div className='spinner mr-2'></div>
									Signing In...
								</>
							) : (
								"Sign In"
							)}
						</button>
					</form>
				)}

				<div className='mt-6 text-center'>
					<p className='text-gray-600 text-sm'>
						{isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
						<button
							type='button'
							onClick={toggleForm}
							className='text-blue-600 hover:text-blue-700 font-medium'
						>
							{isLogin ? "Sign Up" : "Sign In"}
						</button>
					</p>
				</div>

				<div className='mt-4 text-center'>
					<button
						onClick={onBackToHome}
						className='text-gray-500 hover:text-gray-700 text-sm'
					>
						← Back to Home
					</button>
				</div>
			</div>
		</div>
	);
}

export default AuthPage;
