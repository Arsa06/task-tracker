import React, { useCallback, useEffect, useMemo } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Card, Button } from '../components/ui/Base';
import { differenceInCalendarDays, format, startOfDay } from 'date-fns';
import LazyModal from '../lazy/LazyModal';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import { useModal } from '../hooks/useModal';
import { useProfile } from '../context/ProfileContext';
import { 
    ShieldCheck, 
    Trophy, 
    Zap, 
    CheckCircle2, 
    Edit3,
    Camera,
    Mail,
    MapPin,
    Globe,
    Link as LinkIcon,
    Share2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const getProfileInitials = (fullName) => {
    const parts = fullName
        .split(' ')
        .map((part) => part.trim())
        .filter(Boolean)
        .slice(0, 2);

    if (parts.length === 0) {
        return 'TY';
    }

    return parts.map((part) => part[0].toUpperCase()).join('');
};

const calculateCompletionStreak = (tasks) => {
    const completedDays = [...new Set(tasks
        .filter((task) => task.completed)
        .map((task) => task.deadline || task.createdAt)
        .filter(Boolean)
        .map((dateValue) => startOfDay(new Date(dateValue)).getTime()))]
        .sort((leftDay, rightDay) => rightDay - leftDay);

    if (completedDays.length === 0) {
        return 0;
    }

    return completedDays.slice(1).reduce((streak, dayValue, index) => {
        if (differenceInCalendarDays(new Date(completedDays[index]), new Date(dayValue)) === 1) {
            return streak + 1;
        }

        return streak;
    }, 1);
};

const copyTextToClipboard = async (text) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const helperTextArea = document.createElement('textarea');
    helperTextArea.value = text;
    helperTextArea.setAttribute('readonly', '');
    helperTextArea.style.position = 'absolute';
    helperTextArea.style.left = '-9999px';

    document.body.appendChild(helperTextArea);
    helperTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(helperTextArea);
};

const Profile = () => {
    const { tasks } = useTaskContext();
    const { darkMode, toggleTheme } = useTheme();
    const { profile, updateProfile } = useProfile();
    const { showToast } = useToast();
    const editModal = useModal(false);

    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const initials = useMemo(() => getProfileInitials(profile.name), [profile.name]);
    const streak = useMemo(() => calculateCompletionStreak(tasks), [tasks]);

    const stats = [
        { label: 'Tasks Created', value: total, icon: <Edit3 className="text-blue-500" /> },
        { label: 'Completed', value: completed, icon: <CheckCircle2 className="text-green-500" /> },
        { label: 'Completion Rate', value: `${rate}%`, icon: <Zap className="text-yellow-500" /> },
        { label: 'Current Streak', value: `${streak} Day${streak === 1 ? '' : 's'}`, icon: <Trophy className="text-accent" /> },
    ];

    const recentCompletions = tasks
        .filter(t => t.completed)
        .slice(0, 4);

    const handleSaveProfile = useCallback((nextProfile) => {
        updateProfile(nextProfile);
        editModal.close();
    }, [editModal, updateProfile]);

    const handleShareProfile = useCallback(async () => {
        const profileUrl = window.location.href;

        try {
            await copyTextToClipboard(profileUrl);
            showToast('Profile link copied! \uD83D\uDCCB', { duration: 3000, variant: 'info' });
        } catch (error) {
            console.error('Unable to copy the profile URL.', error);
        }
    }, [showToast]);

    useEffect(() => {
        const handleSecureKeyUp = (event) => {
            if (event.key === 'PrintScreen') {
                navigator.clipboard?.writeText('').catch(() => {});
                window.alert('Screenshots are disabled on this page');
            }
        };

        document.addEventListener('keyup', handleSecureKeyUp);
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';

        return () => {
            document.removeEventListener('keyup', handleSecureKeyUp);
            document.body.style.userSelect = '';
            document.body.style.webkitUserSelect = '';
        };
    }, []);

    return (
        <div className="secure-content space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            {/* Profile Header Card */}
            <Card className="relative overflow-hidden border-none shadow-2xl">
                <div className="h-40 bg-gradient-to-r from-accent via-indigo-600 to-purple-700"></div>
                <div className="px-8 pb-8">
                    <div className="relative -mt-16 flex flex-col md:flex-row items-end gap-6 mb-6">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl bg-white dark:bg-dark-card p-1 shadow-xl">
                                <div className="w-full h-full rounded-2xl bg-accent flex items-center justify-center text-4xl font-bold text-white uppercase">
                                    {initials}
                                </div>
                            </div>
                            <button className="absolute bottom-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:scale-110 transition-transform">
                                <Camera size={16} className="text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                        <div className="flex-1 pb-2">
                            <h2 className="text-3xl font-bold font-outfit text-gray-900 dark:text-white">{profile.name}</h2>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1.5 text-sm"><ShieldCheck size={16} className="text-accent" /> Group {profile.group}</span>
                                <span className="flex items-center gap-1.5 text-sm"><MapPin size={16} /> {profile.location}</span>
                                <span className="flex items-center gap-1.5 text-sm"><Mail size={16} /> {profile.email}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => editModal.open()}>
                                <Edit3 size={16} /> Edit Profile
                            </Button>
                            <Button variant="primary" size="sm" onClick={handleShareProfile}>
                                <Share2 size={16} /> Share
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
                        {stats.map((stat) => (
                            <div key={stat.label} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3 mb-2">
                                    {stat.icon}
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">Recent Activity</h3>
                    <div className="space-y-4 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 before:dark:bg-gray-800">
                        {recentCompletions.map((activity) => (
                            <div key={activity.id} className="relative pl-14">
                                <div className="absolute left-4 top-1 w-4 h-4 bg-green-500 rounded-full border-4 border-white dark:border-dark-bg z-10" />
                                <Card className="p-4">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Completed Task</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">"{activity.title}"</p>
                                    <span className="text-[10px] text-gray-400 mt-2 block uppercase font-bold tracking-widest">
                                        {format(new Date(), 'MMM d, yyyy')}
                                    </span>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Account Settings / Socials */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">Settings</h3>
                    <Card className="divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-accent/10 text-accent rounded-lg">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">Appearance</p>
                                    <p className="text-xs text-gray-500">Enable dark theme for eye comfort</p>
                                </div>
                            </div>
                            <button 
                                onClick={toggleTheme}
                                className={`w-12 h-6 rounded-full relative transition-colors ${darkMode ? 'bg-accent' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${darkMode ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                        <div className="p-6">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Connect Accounts</h4>
                            <div className="flex gap-4">
                                <button className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl hover:text-accent transition-all">
                                    <Globe size={24} />
                                </button>
                                <button className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl hover:text-blue-400 transition-all">
                                    <LinkIcon size={24} />
                                </button>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-10 text-center bg-accent border-none text-white relative overflow-hidden group">
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
                        <ShieldCheck size={48} className="mx-auto mb-4 opacity-50" />
                        <h4 className="text-xl font-bold mb-2">Upgrade to Pro</h4>
                        <p className="text-sm opacity-80 mb-6 font-medium">Unlock advanced charts, team collaboration and more.</p>
                        <Button className="bg-white text-accent hover:bg-gray-100 dark:hover:bg-white w-full">Learn More</Button>
                    </Card>
                </div>
            </div>

            <LazyModal
                isOpen={editModal.isOpen}
                onClose={editModal.close}
                title="Edit Profile"
            >
                <ProfileEditForm
                    initialProfile={profile}
                    onCancel={editModal.close}
                    onSave={handleSaveProfile}
                />
            </LazyModal>
        </div>
    );
};

export default Profile;
