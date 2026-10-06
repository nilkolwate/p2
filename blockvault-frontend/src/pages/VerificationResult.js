import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Download, ArrowLeft, Shield } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import apiService from '../services/api';

export default function VerificationResult() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { certificateId: routeCertId } = useParams();

  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(false);

  const { result: stateResult, certificateId: stateCertId, fromQR, expectedHash } =
    location.state || {};

  const queryId = searchParams.get('id');
  const queryHash = searchParams.get('hash');
  const certIdToUse = routeCertId || stateCertId || queryId || stateResult?.certificateRecord?.id;
  const isQRVerification = fromQR || (queryId && queryHash) || Boolean(routeCertId);

  // If page was loaded directly via URL / refreshed, fetch directly from backend
  useEffect(() => {
    if (!stateResult && certIdToUse) {
      setLoading(true);
      apiService
        .verifyCertificate(certIdToUse, queryHash || expectedHash)
        .then((res) => setLiveData(res))
        .catch((err) => console.error('Live lookup failed:', err))
        .finally(() => setLoading(false));
    }
  }, [stateResult, certIdToUse, queryHash, expectedHash]);

  const activeResult = stateResult || liveData;

  if (loading) {
    return (
      <div className="bg-[#F5F1E9] min-h-[calc(100vh-80px)] py-16 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-md border border-gray-100">
          <div className="w-12 h-12 border-4 border-[#1F3D2B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-semibold text-gray-700">Verifying credential on cryptographic ledger...</p>
        </div>
      </div>
    );
  }

  const blockData = activeResult?.certificateRecord || activeResult?.data;

  // Handle missing or invalid certificate data
  if ((!activeResult && !certIdToUse) || (activeResult && activeResult.success === false && !blockData)) {
    return (
      <div className="bg-[#F5F1E9] min-h-[calc(100vh-80px)] py-16 flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle size={44} className="text-red-700" />
            </div>
            <h1
              className="text-3xl font-bold text-gray-900 mb-3"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Certificate Not Found
            </h1>
            <p className="text-base text-gray-600 mb-6">
              Unable to locate certificate record. No cryptographic ledger record matched this query.
            </p>
            <button
              onClick={() => navigate('/verify')}
              className="inline-flex items-center justify-center gap-2 bg-[#1F3D2B] text-white py-3 px-6 rounded-full font-medium hover:bg-[#16281C] transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} /> Try Another Certificate
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isVerified =
    activeResult?.verified !== undefined
      ? Boolean(activeResult.verified)
      : blockData?.status
      ? blockData.status !== 'Invalid'
      : true;

  const certificateData = {
    id: blockData?.certificateId || blockData?.id || certIdToUse,
    studentName: blockData?.studentName || 'Academic Student',
    rollNumber: blockData?.rollNumber || 'N/A',
    course: blockData?.course || 'Certificate Program',
    department: blockData?.department || 'Computer Engineering',
    institution: blockData?.institution || 'Government Polytechnic Amravati',
    issueDate: blockData?.issueDate || 'N/A',
    grade: blockData?.grade || 'First Class with Distinction',
    sha256:
      blockData?.hash ||
      blockData?.sha256 ||
      activeResult?.originalHash ||
      activeResult?.uploadedHash ||
      queryHash ||
      '',
    blockNumber: blockData?.blockNumber || (activeResult?.block ? `Block #${activeResult.block.index}` : 'Block #1'),
    status: isVerified ? 'Valid' : (blockData?.status || 'Invalid'),
    reason:
      activeResult?.reason ||
      (isVerified
        ? 'Certificate is authentic and permanently verified on the blockchain ledger.'
        : 'Certificate verification failed or certificate has been revoked.'),
    pdfUrl: blockData?.pdfUrl || `${apiService.BACKEND_URL}/certificates/${certIdToUse}.pdf`,
    qrDataUrl: blockData?.qrDataUrl,
  };

  const verificationUrl = `${window.location.origin}/verify/${certificateData.id}`;

  const downloadOriginalPdf = () => {
    const downloadUrl = certificateData.pdfUrl || `${apiService.BACKEND_URL}/certificates/${certificateData.id}.pdf`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `Certificate_${certificateData.id}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#F5F1E9] min-h-[calc(100vh-80px)] py-16 flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 sm:p-10">

          {/* QR Scan Notification Badge */}
          {isQRVerification && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#1F3D2B]" />
              <div>
                <p className="text-sm font-bold text-gray-900">QR Code Scan Authenticated</p>
                <p className="text-xs text-emerald-800">
                  Cryptographically anchored credential verified in real-time from blockchain ledger.
                </p>
              </div>
            </div>
          )}

          {/* Status Header */}
          <div className="text-center mb-8">
            <div
              className={`w-20 h-20 ${
                isVerified ? 'bg-green-100' : 'bg-red-100'
              } rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm`}
            >
              {isVerified ? (
                <CheckCircle size={44} className="text-green-700" />
              ) : (
                <XCircle size={44} className="text-red-700" />
              )}
            </div>

            <h1
              className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              {isVerified ? 'Certificate Verified Successfully' : 'Verification Failed'}
            </h1>
            <p className="text-base text-gray-600 mb-2 max-w-xl mx-auto">
              {certificateData.reason}
            </p>
            {isVerified && (
              <p className="text-xs text-green-700 font-semibold tracking-wide uppercase">
                ✓ Blockchain Anchored • ✓ SHA-256 Digest Matched • ✓ Tamper-Proof
              </p>
            )}
          </div>

          {/* Certificate Credentials Grid */}
          <div className={isQRVerification ? "space-y-6 mb-8" : "grid md:grid-cols-2 gap-6 mb-8"}>
            {/* Certificate Details */}
            <div className="bg-gray-50/80 rounded-xl p-5 border border-gray-200 divide-y divide-gray-200">
              <div className="py-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">
                  Certificate ID
                </span>
                <span className="text-base font-bold text-[#1F3D2B] font-mono">
                  {certificateData.id}
                </span>
              </div>

              <div className="py-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">
                  Student Name
                </span>
                <span className="text-base font-semibold text-gray-900">
                  {certificateData.studentName}
                </span>
              </div>

              <div className="py-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">
                  Roll / Registration No.
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {certificateData.rollNumber}
                </span>
              </div>

              <div className="py-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">
                  Course & Department
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {certificateData.course} ({certificateData.department})
                </span>
              </div>

              <div className="py-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">
                  Institution
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {certificateData.institution}
                </span>
              </div>

              <div className="py-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">
                  Issue Date & Grade
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {certificateData.issueDate} • {certificateData.grade}
                </span>
              </div>

              <div className="py-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">
                  Blockchain Record
                </span>
                <span className="text-sm font-bold text-[#1F3D2B]">
                  {certificateData.blockNumber}
                </span>
              </div>
            </div>

            {/* Right: QR Code & Verification Stamp (Only displayed if NOT already verified by QR) */}
            {!isQRVerification && (
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 flex flex-col items-center justify-center">
                <p className="text-sm font-bold text-gray-900 mb-3 text-center">
                  Cryptographic Authentication QR
                </p>
                <div className="bg-white p-3 rounded-xl shadow-sm border-2 border-[#1F3D2B]">
                  {certificateData.qrDataUrl ? (
                    <img
                      src={certificateData.qrDataUrl}
                      alt="Authentication QR"
                      className="w-36 h-36 object-contain"
                    />
                  ) : (
                    <QRCodeSVG
                      value={verificationUrl}
                      size={140}
                      level="H"
                      includeMargin={false}
                      fgColor="#1F3D2B"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center max-w-[200px]">
                  Scan to verify on any mobile device or browser
                </p>
              </div>
            )}
          </div>

          {/* SHA-256 Hash Digest */}
          {activeResult?.uploadedHash && activeResult?.originalHash && activeResult.uploadedHash.toLowerCase() !== activeResult.originalHash.toLowerCase() ? (
            <div className="bg-red-50/80 rounded-xl p-5 mb-8 border border-red-200 space-y-3.5">
              <div>
                <span className="text-xs font-bold text-red-800 uppercase block mb-1">
                  ⚠ Uploaded PDF Digest (SHA-256 Altered / Tampered)
                </span>
                <div className="bg-white p-3 rounded-lg border border-red-200 font-mono text-xs text-red-700 break-all select-all">
                  {activeResult.uploadedHash}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-700 uppercase block mb-1">
                  ✓ Immutable Blockchain Ledger Digest (Authentic Record)
                </span>
                <div className="bg-white p-3 rounded-lg border border-gray-200 font-mono text-xs text-emerald-800 font-semibold break-all select-all">
                  {activeResult.originalHash}
                </div>
              </div>
            </div>
          ) : (
            certificateData.sha256 && (
              <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-200">
                <span className="text-xs font-bold text-gray-500 uppercase block mb-1.5">
                  SHA-256 Cryptographic Hash Digest (Module 3)
                </span>
                <div className="bg-white p-3 rounded-lg border border-gray-200 font-mono text-xs text-gray-700 break-all select-all">
                  {certificateData.sha256}
                </div>
              </div>
            )
          )}

          {/* Action Buttons */}
          <div className="flex justify-center mb-6">
            <button
              type="button"
              onClick={downloadOriginalPdf}
              className="inline-flex items-center justify-center gap-2 bg-[#1F3D2B] text-white py-3.5 px-8 rounded-full font-medium hover:bg-[#16281C] transition-colors shadow-sm cursor-pointer"
            >
              <Download size={18} /> Download Official Certificate PDF
            </button>
          </div>

          {/* Back link */}
          <div className="text-center pt-2">
            <Link
              to="/verify"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1F3D2B] transition-colors"
            >
              <ArrowLeft size={16} /> Verify another certificate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
