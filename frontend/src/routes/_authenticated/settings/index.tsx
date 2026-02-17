import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { CameraIcon, UserCircleIcon, LockClosedIcon, TrashIcon, EyeIcon, EyeSlashIcon, CheckIcon, XMarkIcon} from '@heroicons/react/24/outline';
import { useState, useRef, useEffect, useContext } from 'react';
import { BACKEND, PROFILE_PIC } from '../../../config/env';
import Croppie from 'croppie'; 
import 'croppie/croppie.css';
import { authFetch } from '../../../api/authFetch';
import { toast } from 'react-toastify';
import ButtonSpinner from '../../../components/ButtonSpinner';
import { AuthContext } from '../../../contexts/Auth/AuthContext';
import { useMutation } from '@tanstack/react-query';

export const Route = createFileRoute('/_authenticated/settings/')({
  component: RouteComponent,
})


function RouteComponent (){
  // const {auth} = Route.useRouteContext();
  // const router = useRouter();
  // const navigate = useNavigate();
  const auth = useContext(AuthContext);
  // const [profile, setProfile] = useState<User>(() => auth.user!);
  const profile = auth!.user!;

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tempUsername, setTempUsername] = useState(profile.username);
  const [tempEmail, setTempEmail] = useState(profile.email);
  const [isUpdatingProfilePic, setIsUpdatingProfilePic] = useState<boolean>(false);
  
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  const croppieRef = useRef<HTMLDivElement>(null);
  const croppieInstanceRef = useRef<Croppie | null>(null);

  useEffect(() => {
    // Check if modal is open, image exists, and the div ref is ready
    if (showCropModal && tempImageUrl && croppieRef.current) {
      
      // Destroy previous instance if it exists to prevent duplicates
      if (croppieInstanceRef.current) {
        croppieInstanceRef.current.destroy();
      }

      // 2. Initialize using the imported class (No window.Croppie needed)
      croppieInstanceRef.current = new Croppie(croppieRef.current, {
        viewport: { width: 200, height: 200, type: 'circle' },
        boundary: { width: 300, height: 300 },
        showZoomer: true,
        enableOrientation: true,
      });

      croppieInstanceRef.current.bind({
        url: tempImageUrl,
      });
    }
    
    // Cleanup function
    return () => {
      if (croppieInstanceRef.current) {
        croppieInstanceRef.current.destroy();
        croppieInstanceRef.current = null;
      }
    };
  }, [showCropModal, tempImageUrl]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImageUrl(reader.result as string);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    if (!croppieInstanceRef.current || !selectedFile) return;
    
    setIsUpdatingProfilePic(true);
    
    try {
      const extension = 'jpg'
      
      // Always use JPEG format
      const format = 'jpeg';
      const mimeType = 'image/jpeg';

      // Get cropped image as blob with original format
      const blob = await croppieInstanceRef.current.result({
        type: 'blob',
        size: 'viewport',
        format: format,
        quality: 1,
        circle: false,
      });

      // Create unique filename with correct extension
      const filename = `${profile.username}_${Date.now()}.${extension}`;

      // Update backend with new profile picture filename
      const updateResponse = await authFetch(`${BACKEND}/me/update-profile-picture`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_pic: filename, old_profile_pic: profile.profile_pic })
      }, auth!);

      if (!updateResponse.ok) {
        throw new Error('Failed to update profile picture');
      }

      // Get presigned URL from backend
      const presignedResponse = await authFetch(`${BACKEND}/me/generate-presignedurl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_name: filename, file_type: 'image/jpeg'})
      }, auth!);

      if (!presignedResponse.ok) {
        throw new Error('Failed to update profile picture');
      }

      const { presigned_url } = await presignedResponse.json();

      // Upload to R2 with correct MIME type
      const uploadResponse = await fetch(presigned_url, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': mimeType, // Use original MIME type,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to update profile picture');
      }

      // Update local state
      const updatedProfile = { ...profile, profile_pic: filename };
      // setProfile(updatedProfile);
      auth!.updateUserProfile(updatedProfile);
      setShowCropModal(false);
      setTempImageUrl('');
      setSelectedFile(null); // Clear selected file
      toast.success('Profile picture updated successfully', {autoClose: 2000});
    } catch (error: any) {
      toast.error(error.message, {autoClose: 2000})    
    } finally {
      setIsUpdatingProfilePic(false);
    }
  };


  const handleCropCancel = () => {
    setShowCropModal(false);
    setTempImageUrl('');
  };

  const updateUsernameMutation = useMutation({
    mutationFn: async(newUsername: string) => {
      const res = await authFetch(`${BACKEND}/me/update-username`, 
        {
          method: 'PATCH', 
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({new_username: newUsername})
        }, auth!)
      const data = await res.json();
      if(res.ok){
        return data;
      }else{
        throw Error(data.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      toast.success('Username updated successfully!');
      setIsEditingUsername(false);
      auth?.updateUserProfile({...profile, username: data.username});
    }
  })

  const handleUsernameUpdate = () => {
    const newUsername = tempUsername.trim();
    if(newUsername.length < 4 || newUsername.length > 30 || newUsername.startsWith('-')){
      toast.error('The username must be in between 4 and 30 characters and must not start with a hyphen');
      return;
    }
    updateUsernameMutation.mutate(newUsername);
  };

  // const handleEmailUpdate = () => {
  //   if (tempEmail.trim() && tempEmail.includes('@')) {
  //     setProfile({ ...profile, email: tempEmail });
  //     setIsEditingEmail(false);
  //   }
  // };

  const updatePasswordMutation = useMutation({
    mutationFn: async({newPassword, currentPassword} : {newPassword: string, currentPassword: string}) => {
      const res = await authFetch(`${BACKEND}/me/update-password`, 
        {
          method: 'PATCH', 
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({new_password: newPassword, current_password: currentPassword})
        }, auth!)
      // const data = await res.json();
      if(!res.ok){
        const error = await res.json();
        throw Error(error.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Password updated successfully! Please login with the new one!', {autoClose: 3000});
      setTimeout(() => {
        auth?.logout();
      }, 3000);
    }
  })


  const handlePasswordChange = () => {
    if (passwordData.current && passwordData.new && passwordData.new === passwordData.confirm) {
      setShowChangePassword(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    }
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation === 'DELETE') {
      setShowDeleteAccount(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .transition-smooth {
          transition: all 0.2s ease;
        }
        
        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }
        
        .modal-content {
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          width: 90%;
        }
      `}</style>
      
      {/* Load Croppie CSS and JS */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/croppie/2.6.5/croppie.min.css" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/croppie/2.6.5/croppie.min.js"></script>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Profile Settings
          </h1>
          <p className="text-sm text-gray-600">Manage your account preferences and security</p>
        </div>

        {/* Account Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 mb-4 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">Account Information</h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Profile Picture */}
            <div className="flex items-start gap-6">
              <div className="shrink-0">
                <div className="relative group ">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                    id="profile-picture-upload"
                  />
                  <label htmlFor="profile-picture-upload" className=" block">
                    <div className="relative">
                      <img
                        key={profile.profile_pic}
                        src={`${PROFILE_PIC}/${profile.profile_pic}`}
                        alt="Profile"
                        className="w-25 h-25 rounded-full object-cover border border-gray-200"
                      />
                      <div className="absolute inset-0 rounded-lg bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-smooth">
                        <CameraIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-smooth" />
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <CameraIcon className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Profile Picture</h3>
                </div>
                <p className="text-sm text-gray-500 mb-3">JPG, PNG. Max size 5MB.</p>
                <label
                  htmlFor="profile-picture-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-smooth  font-medium"
                >
                  Choose File
                </label>
              </div>
            </div>

            {/* Username */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <UserCircleIcon className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-900">Username</h3>
              </div>
              
              {!isEditingUsername ? (
                <div className="flex items-center justify-between bg-gray-50 rounded-md px-4 py-2.5 border border-gray-200">
                  <span className="text-sm text-gray-900">{profile.username}</span>
                  <button
                    onClick={() => {
                      setIsEditingUsername(true);
                      setTempUsername(profile.username);
                    }}
                    className=" px-3 py-1 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-smooth font-medium"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-smooth"
                    placeholder="Enter username"
                  />
                  <div className="flex gap-2">
                    <button
                      disabled={updateUsernameMutation.isPending}
                      onClick={handleUsernameUpdate}
                      className=" flex-1 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-smooth flex items-center justify-center gap-1.5 font-medium"
                    >
                      {updateUsernameMutation.isPending ? (
                          <>
                            Saving...
                            <ButtonSpinner />
                          </>
                        ) : (
                          <>
                            <CheckIcon className="w-4 h-4" />
                            Save
                          </>
                        )
                      }
                    </button>
                    <button
                      onClick={() => setIsEditingUsername(false)}
                      className=" px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-smooth flex items-center gap-1.5 font-medium"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                {/* <Mail className="w-4 h-4 text-gray-500" /> */}
                <h3 className="text-sm font-medium text-gray-900">Email Address</h3>
              </div>
              
              {!isEditingEmail ? (
                <div className="flex items-center justify-between bg-gray-50 rounded-md px-4 py-2.5 border border-gray-200">
                  <span className="text-sm text-gray-900">{profile.email}</span>
                  <button
                    onClick={() => {
                      setIsEditingEmail(true);
                      setTempEmail(profile.email);
                    }}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-smooth font-medium"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="email"
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-smooth"
                    placeholder="Enter email address"
                  />
                  <div className="flex gap-2">
                    <button
                      // onClick={handleEmailUpdate}
                      className="flex-1 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-smooth flex items-center justify-center gap-1.5 font-medium"
                    >
                      <CheckIcon className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingEmail(false)}
                      className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-smooth flex items-center gap-1.5 font-medium"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-lg border border-gray-200 mb-4 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">Security</h2>
          </div>
          
          <div className="p-6">
            {/* Change Password */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <LockClosedIcon className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-900">Change Password</h3>
              </div>
              
              {!showChangePassword ? (
                <button
                  onClick={() => setShowChangePassword(true)}
                  className=" w-full py-2.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-smooth font-medium"
                >
                  Update Password
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.current}
                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                        className="w-full px-3 py-2 pr-10 text-sm bg-white border border-gray-300 rounded-md focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-smooth"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.new}
                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                        className="w-full px-3 py-2 pr-10 text-sm bg-white border border-gray-300 rounded-md focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-smooth"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirm}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                        className="w-full px-3 py-2 pr-10 text-sm bg-white border border-gray-300 rounded-md focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-smooth"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {passwordData.new && passwordData.confirm && passwordData.new !== passwordData.confirm && (
                    <p className="text-xs text-red-600">Passwords do not match</p>
                  )}
                  
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handlePasswordChange}
                      disabled={!passwordData.current || !passwordData.new || passwordData.new !== passwordData.confirm}
                      className=" flex-1 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-smooth flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      <CheckIcon className="w-4 h-4" />
                      Update Password
                    </button>
                    <button
                      onClick={() => {
                        setShowChangePassword(false);
                        setPasswordData({ current: '', new: '', confirm: '' });
                      }}
                      className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-smooth flex items-center gap-1.5 font-medium"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg border border-red-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-200 bg-red-50">
            <h2 className="text-base font-semibold text-red-900">Danger Zone</h2>
          </div>
          
          <div className="p-6">
            <div className="flex items-start gap-3 mb-3">
              <TrashIcon className="w-4 h-4 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 mb-1">Delete Account</h3>
                <p className="text-xs text-gray-600">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
              </div>
            </div>
            
            {!showDeleteAccount ? (
              <button
                onClick={() => setShowDeleteAccount(true)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-smooth flex items-center gap-2 font-medium"
              >
                <TrashIcon className="w-4 h-4" />
                Delete Account
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-xs text-red-900 font-medium mb-1">⚠️ Warning: This action cannot be undone!</p>
                  <p className="text-xs text-red-800">
                    Type <span className="font-semibold">DELETE</span> to confirm deletion.
                  </p>
                </div>
                
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-red-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition-smooth"
                  placeholder="Type DELETE to confirm"
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmation !== 'DELETE'}
                    className="flex-1 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 font-medium"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Permanently Delete
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteAccount(false);
                      setDeleteConfirmation('');
                    }}
                    className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-smooth flex items-center gap-1.5 font-medium"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Crop Modal */}
      {showCropModal && (
        <div className="modal-overlay" onClick={handleCropCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Crop Profile Picture</h3>
            </div>
            
            <div className="p-6">
              <div ref={croppieRef} className="mx-auto"></div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCropSave}
                  disabled={isUpdatingProfilePic}
                  className=" flex-1 py-2.5 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-smooth flex items-center justify-center gap-1.5 font-medium"
                >
                  {isUpdatingProfilePic ? (
                      <>
                        Saving
                        <ButtonSpinner />
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        Save
                      </>
                    )
                  }
                </button>
                <button
                  onClick={handleCropCancel}
                  className=" px-6 py-2.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-smooth flex items-center gap-1.5 font-medium"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
