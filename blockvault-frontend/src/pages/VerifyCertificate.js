import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UploadCloud, CheckCircle, ArrowRight, FileText, QrCode, Camera, Image, RefreshCw, XCircle } from 'lucide-react';
import jsQR from 'jsqr';
import apiService from '../services/api';

// Browser-side SHA-256 calculation for PDF verification (Module 3)
async function calculateSha256(file) {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function VerifyCertificate() {
  const [activeTab, setActiveTab] = useState('qr'); // Default to QR scanning tab as requested
  const [certId, setCertId] = useState('');
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // QR Code Tab States
  const [qrTextInput, setQrTextInput] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isScanningRef = useRef(false);

  // Check if opened from QR code scan (?id=...&hash=...)
  useEffect(() => {
    const qrId = searchParams.get('id');
    const qrHash = searchParams.get('hash');

    if (qrId) {
      setCertId(qrId);
      setActiveTab('id');
      handleDirectVerification(qrId, qrHash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Clean up camera stream when unmounting or switching tabs
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleDirectVerification = async (id, hash) => {
    setLoading(true);
    setError('');

    try {
      const result = await apiService.verifyCertificate(id, hash);
      navigate('/verify/result', {
        state: {
          result,
          certificateId: id,
          fromQR: Boolean(hash),
          expectedHash: hash,
        },
      });
    } catch (err) {
      setError('Certificate verification failed. Certificate ID not found.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // QR CODE PROCESSING HELPERS
  // ==========================================

  const extractIdFromText = (text) => {
    if (!text) return '';
    const trimmed = text.trim();

    // 1. Direct ID (e.g. BV-2026-2293B257)
    if (/^[A-Za-z0-9_-]+$/.test(trimmed) && trimmed.length >= 4 && trimmed.length <= 40) {
      return trimmed;
    }

    // 2. URL path: .../verify/CERT_ID
    const pathMatch = trimmed.match(/\/verify\/([A-Za-z0-9_-]+)/i);
    if (pathMatch && pathMatch[1] && pathMatch[1].toLowerCase() !== 'result') {
      return pathMatch[1];
    }

    // 3. Query string: ?id=CERT_ID or ?certificateId=CERT_ID
    const queryMatch = trimmed.match(/[?&](?:id|certificateId)=([A-Za-z0-9_-]+)/i);
    if (queryMatch && queryMatch[1]) {
      return queryMatch[1];
    }

    // 4. JSON format: {"id": "...", "certificateId": "..."}
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && (parsed.certificateId || parsed.id)) {
        return parsed.certificateId || parsed.id;
      }
    } catch (_) {}

    return trimmed;
  };

  const processQRData = async (decodedString) => {
    if (!decodedString || !decodedString.trim()) {
      setError('No QR code content detected.');
      return;
    }

    stopCamera();
    setLoading(true);
    setError('');

    const trimmedInput = decodedString.trim();
    const certId = extractIdFromText(trimmedInput);

    // Extract hash from QR URL query string if present (?hash=...)
    let hash = null;
    const hashMatch = trimmedInput.match(/[?&]hash=([a-fA-F0-9]{64})/i);
    if (hashMatch) {
      hash = hashMatch[1];
    }

    try {
      // 1. Try verifyQRCode with the scanned content
      let result = await apiService.verifyQRCode(trimmedInput, hash);

      // 2. If not found and we have an extracted ID, try with extracted ID
      if ((!result || !result.success || !result.certificateRecord) && certId && certId !== trimmedInput) {
        result = await apiService.verifyQRCode(certId, hash);
      }

      if (result && result.success && result.certificateRecord) {
        navigate(`/verify/${result.certificateRecord.id}`, {
          state: {
            result,
            certificateId: result.certificateRecord.id,
            fromQR: true,
            expectedHash: hash,
          },
        });
        return;
      }

      // 3. Fallback: Lookup directly via getCertificateById
      if (certId) {
        const directRes = await apiService.getCertificateById(certId);
        if (directRes && directRes.success && directRes.data) {
          navigate(`/verify/${certId}`, {
            state: {
              result: {
                success: true,
                verified: directRes.data.status !== 'Invalid',
                certificateRecord: directRes.data,
              },
              certificateId: certId,
              fromQR: true,
              expectedHash: hash,
            },
          });
          return;
        }
      }

      setError(result?.message || `Certificate record not found for scanned QR code.`);
    } catch (err) {
      console.error('QR verification error:', err);
      setError('Failed to verify QR code. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Decode QR from uploaded image file
  const handleQRImageUpload = (e) => {
    setError('');
    const qrImageFile = e.target.files && e.target.files[0];
    if (!qrImageFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });
        if (code && code.data) {
          processQRData(code.data);
        } else {
          setError('Could not detect a valid QR code in this image. Please ensure the QR code is clear and well-lit.');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(qrImageFile);
  };

  // Camera QR Scanner logic
  const startCamera = async () => {
    setCameraError('');
    setError('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access requires HTTPS or a supported modern browser. You can upload a QR image or paste the code instead.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        isScanningRef.current = true;
        setIsCameraActive(true);
        animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      isScanningRef.current = false;
      setIsCameraActive(false);
      setCameraError('Camera access denied or unavailable. You can upload a QR image or paste the code text instead.');
    }
  };

  const stopCamera = () => {
    isScanningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const scanVideoFrame = () => {
    if (!isScanningRef.current) return;

    const video = videoRef.current;
    if (video && video.readyState >= 2) {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx && canvas.width > 0 && canvas.height > 0) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });
        if (code && code.data) {
          stopCamera();
          processQRData(code.data);
          return;
        }
      }
    }

    if (isScanningRef.current) {
      animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
    }
  };

  // ==========================================
  // REGULAR VERIFICATION HANDLERS (PDF & ID)
  // ==========================================

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'upload') {
        if (!file) {
          setError('Please select a certificate PDF file.');
          setLoading(false);
          return;
        }

        // Calculate cryptographic hash of uploaded PDF in browser
        const computedHash = await calculateSha256(file);

        // First attempt: Server-side PDF parsing and verification
        try {
          const uploadRes = await apiService.verifyUploadedFile(file, certId.trim());
          if (uploadRes && uploadRes.success) {
            navigate('/verify/result', {
              state: {
                result: uploadRes,
                certificateId: uploadRes.certificateRecord?.id || certId.trim() || '',
                uploadedHash: uploadRes.uploadedHash || computedHash,
                originalHash: uploadRes.originalHash,
              },
            });
            return;
          }
        } catch (uploadErr) {
          console.warn('Backend file upload verification unavailable, trying direct hash verification:', uploadErr);
        }

        // Fallback: Direct hash verification
        if (certId.trim()) {
          const result = await apiService.verifyCertificate(certId.trim(), computedHash);
          navigate('/verify/result', {
            state: {
              result,
              certificateId: certId.trim(),
              uploadedHash: computedHash,
            },
          });
        } else {
          // If no ID provided, match computed hash across certificates
          const certsRes = await apiService.getCertificates();
          const allCerts = certsRes?.data || [];
          const matched = allCerts.find(
            (c) => (c.hash || c.sha256 || '').toLowerCase() === computedHash.toLowerCase()
          );

          if (matched) {
            const result = await apiService.verifyCertificate(matched.id, computedHash);
            navigate('/verify/result', {
              state: {
                result,
                certificateId: matched.id,
                uploadedHash: computedHash,
              },
            });
          } else {
            navigate('/verify/result', {
              state: {
                result: {
                  verified: false,
                  reason: 'No certificate matching this file digest was found on the blockchain ledger.',
                  uploadedHash: computedHash,
                },
                uploadedHash: computedHash,
              },
            });
          }
        }
      } else if (activeTab === 'id') {
        if (!certId.trim()) {
          setError('Please enter a Certificate ID');
          setLoading(false);
          return;
        }

        const result = await apiService.verifyCertificate(certId.trim());
        navigate('/verify/result', {
          state: {
            result,
            certificateId: certId.trim(),
          },
        });
      } else if (activeTab === 'qr') {
        if (!qrTextInput.trim()) {
          setError('Please enter or scan a QR code.');
          setLoading(false);
          return;
        }
        await processQRData(qrTextInput);
      }
    } catch (err) {
      setError('Verification service temporarily unavailable. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5F1E9] min-h-[calc(100vh-80px)] py-16">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Verify Certificate Authenticity
          </h1>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Scan the certificate QR code, upload the official PDF, or enter the unique ID to instantly verify against the blockchain ledger.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-4xl mx-auto items-start">
          {/* Left / Main Card (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
            {/* Tabs: QR Code, PDF Upload, Certificate ID */}
            <div className="flex border-b border-gray-200 mb-6 gap-2">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setActiveTab('qr');
                }}
                className={`pb-3 px-4 font-medium text-sm transition-colors relative cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'qr'
                    ? 'text-[#1F3D2B] border-b-2 border-[#1F3D2B] font-bold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <QrCode size={16} /> Scan QR Code
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setActiveTab('upload');
                }}
                className={`pb-3 px-4 font-medium text-sm transition-colors relative cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'upload'
                    ? 'text-[#1F3D2B] border-b-2 border-[#1F3D2B] font-bold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText size={16} /> Upload PDF
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setActiveTab('id');
                }}
                className={`pb-3 px-4 font-medium text-sm transition-colors relative cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'id'
                    ? 'text-[#1F3D2B] border-b-2 border-[#1F3D2B] font-bold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Enter ID
              </button>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                <XCircle size={18} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {cameraError && (
              <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                {cameraError}
              </div>
            )}

            {/* TAB 1: SCAN QR CODE */}
            {activeTab === 'qr' && (
              <div className="space-y-6">
                {/* Camera Scanner View */}
                {isCameraActive ? (
                  <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-[#1F3D2B] shadow-inner text-center">
                    <video ref={videoRef} className="w-full h-64 object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute inset-0 border-2 border-white/40 pointer-events-none flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-emerald-400 rounded-xl animate-pulse" />
                    </div>
                    <div className="p-3 bg-black/75 text-white flex items-center justify-between">
                      <span className="text-xs text-emerald-300 font-medium">Scanning for QR code...</span>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Stop Camera
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Option A: Start Camera */}
                    <button
                      type="button"
                      onClick={startCamera}
                      className="p-6 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#1F3D2B] hover:bg-green-50/40 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-green-100 text-[#1F3D2B] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera size={24} />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900 text-sm">Scan with Camera</p>
                        <p className="text-xs text-gray-500 mt-0.5">Use webcam or mobile camera</p>
                      </div>
                    </button>

                    {/* Option B: Upload QR Image */}
                    <label className="p-6 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#1F3D2B] hover:bg-green-50/40 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group text-center">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleQRImageUpload}
                      />
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Image size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Upload QR Image</p>
                        <p className="text-xs text-gray-500 mt-0.5">PNG, JPG, or screenshot</p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Option C: Paste QR Content or URL */}
                <form onSubmit={handleVerify} className="space-y-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Or Paste Scanned QR Code / Verification Link
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BV-2026-2293B257 or http://.../verify/BV-2026-2293B257"
                      value={qrTextInput}
                      onChange={(e) => setQrTextInput(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F3D2B] text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !qrTextInput.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#1F3D2B] text-white py-3 rounded-full font-medium hover:bg-[#16281C] transition-colors disabled:opacity-50 cursor-pointer shadow-sm text-sm"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Verifying QR on Blockchain...
                      </>
                    ) : (
                      <>
                        Verify QR Code <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: UPLOAD CERTIFICATE PDF */}
            {activeTab === 'upload' && (
              <form onSubmit={handleVerify} className="space-y-5">
                <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#1F3D2B] transition-colors bg-gray-50/50 block text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <UploadCloud size={28} className="text-[#1F3D2B]" />
                  </div>
                  <p className="font-medium text-gray-900 mb-1">
                    {fileName ? fileName : 'Drag & drop official PDF here or click to browse'}
                  </p>
                  <p className="text-xs text-gray-500">Computes SHA-256 fingerprint in real-time</p>
                </label>

                <div>
                  <label htmlFor="cert-id-opt" className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Certificate ID <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="cert-id-opt"
                    type="text"
                    placeholder="e.g. BV-2026-2293B257"
                    value={certId}
                    onChange={(e) => setCertId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F3D2B] text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !file}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#1F3D2B] text-white py-3.5 rounded-full font-medium hover:bg-[#16281C] transition-colors disabled:opacity-50 cursor-pointer shadow-sm text-sm"
                >
                  {loading ? 'Verifying PDF Hash...' : 'Verify Authenticity'} <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* TAB 3: ENTER CERTIFICATE ID */}
            {activeTab === 'id' && (
              <form onSubmit={handleVerify} className="space-y-5">
                <div>
                  <label htmlFor="cert-id-main" className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Certificate ID *
                  </label>
                  <input
                    id="cert-id-main"
                    type="text"
                    required
                    placeholder="e.g. BV-2026-2293B257"
                    value={certId}
                    onChange={(e) => setCertId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F3D2B] text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Enter the unique identifier printed on the certificate or block ledger receipt.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !certId.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#1F3D2B] text-white py-3.5 rounded-full font-medium hover:bg-[#16281C] transition-colors disabled:opacity-50 cursor-pointer shadow-sm text-sm"
                >
                  {loading ? 'Verifying on Ledger...' : 'Lookup & Verify'} <ArrowRight size={18} />
                </button>
              </form>
            )}
          </div>

          {/* Right Column / Verification Highlights */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <QrCode size={20} className="text-[#1F3D2B]" />
                <h3
                  className="text-lg font-bold text-gray-900"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                >
                  QR Authentication
                </h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Every certificate issued carries a tamper-evident QR code linked to its SHA-256 cryptographic digest on the blockchain.
              </p>
            </div>

            <ul className="space-y-4 text-xs">
              {[
                {
                  title: 'Instant QR Scan',
                  desc: 'Decodes certificate credentials instantly from your camera or image.',
                },
                {
                  title: 'SHA-256 Digest Match',
                  desc: 'Compares the exact document fingerprint against the original block.',
                },
                {
                  title: 'Immutable Ledger Audit',
                  desc: 'Ensures credentials cannot be altered or fabricated without detection.',
                },
              ].map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <CheckCircle size={16} className="text-[#1F3D2B] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">{item.title}</p>
                    <p className="text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="p-3.5 bg-green-50/80 rounded-xl border border-green-200 text-xs text-green-900">
              <span className="font-bold block mb-1">Mobile Friendly:</span>
              You can scan the QR code from any smartphone camera to verify directly on the network.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
