import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from 'react-router';
import { getMyProfile, updateMyProfile } from "../api/users";
import { useCurrentUser } from "../context/CurrentUserContext";

const CUNY_SCHOOLS = [
  "Baruch College",
  "Borough of Manhattan Community College",
  "Brooklyn College",
  "The City College of New York",
  "College of Staten Island",
  "Hunter College",
  "John Jay College of Criminal Justice",
  "LaGuardia Community College",
  "Lehman College",
  "New York City College of Technology",
  "Queens College",
  "Queensborough Community College",
];

function formatTime(totalSeconds) {
    const seconds = Number(totalSeconds) || 0
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours === 0) { return `${minutes}m`}
    return `${hours}h ${minutes}m`
}


export default function ProfilePage() {
    const { user, setUser } = useCurrentUser()
    const {
        isAuthenticated: isAuth0User,
        isLoading: isAuth0Loading,
        getAccessTokenSilently
    } = useAuth0()

    // Use States
    const [profile, setProfile] = useState(null)
    const [editingField, setEditingField] = useState(null)
    const [draftValue, setDraftValue] = useState('')
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (!user || isAuth0Loading) { return }

        let canceled = false;
        async function loadProfile() {
            try {
                setIsLoadingProfile(true)
                setError("")

                let token = null
                if (isAuth0User) {
                    token = await getAccessTokenSilently()
                }

                const profileData = await getMyProfile(token)
                if (!canceled) {
                    setProfile(profileData)
                }
            } catch (error) {
                if (!canceled) {
                    setError(error.message || "Could not load your profile.")
                }
            } finally {
                if (!canceled) {
                    setIsLoadingProfile(false)
                }
            }
        }

        loadProfile()
        return () => { canceled = true }
    }, [user?.id, isAuth0User, isAuth0Loading, getAccessTokenSilently])

    function startEditing(fieldName) {
        setEditingField(fieldName)
        setDraftValue(profile[fieldName] || "")
        setError("")
        setSuccessMessage("")
    }

    function stopEditing() {
        setEditingField(null)
        setDraftValue("")
        setError("")
    }

    async function handleSubmit() {
        if (!editingField) { return }

        try {
            setIsSaving(true)
            setError("")
            setSuccessMessage("")

            let token = null
            if (isAuth0User) {
                token = await getAccessTokenSilently()
            }

            let value = draftValue
            if (editingField === "displayName") {
                value = draftValue.trim() || null
            }
            if (editingField === "school") {
                value = draftValue || null
            }

            const updates = { [editingField]: value }
            const updatedProfile = await updateMyProfile(token, updates) // PATCH /users/me

            setProfile(updatedProfile)
            setUser(updatedProfile)
            setEditingField(null)
            setDraftValue('')
            setSuccessMessage("Profile updated successfully.")
        } catch (error) {
            setError(error.message || "Could not update your profile.")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoadingProfile || isAuth0Loading) {
        return (<p className="text-center"> Loading profile... </p>)
    }

    if (!profile) {
        return (
            <section className="mx-auto max-w-2xl">
                <h1 className="mb-4 text-3xl font-semibold"> Profile </h1>
                <p className="text-red-500">
                    {error || "Could not load your profile."}
                </p>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-2xl">
            <h1 className="mb-6 text-3xl font-semibold text-(--text-h)">
                Your Profile
            </h1>

            {error && (
                <p className="mb-4 rounded-md bg-red-500/10 px-4 py-3 text-red-500">
                    {error}
                </p>
            )}

            {successMessage && (
                <p className="mb-4 rounded-md bg-green-500/10 px-4 py-3 text-green-600">
                    {successMessage}
                </p>
            )}

            <div className="space-y-4 rounded-lg border border-(--border) p-6">
                {/* Username */}
                <div className="border-b border-(--border) pb-4">
                    <p className="text-sm text-(--text-h)"> Username </p>
                    <p className="mt-1 text-lg"> {profile.username} </p>
                </div>

                {/* Email */}
                <div className="border-b border-(--border) pb-4">
                    <p className="text-sm text-(--text-h)"> Email </p>
                    <p className="mt-1 text-lg"> {profile.email} </p>
                </div>

                {/* Display Name */}
                <div className="border-b border-(--border) pb-4">
                    <div className="flex items-end justify-between gap-4">
                        <div className="flex-1">
                            <p className="text-sm text-(--text-h)"> Display Name </p>

                            {editingField === "displayName" ? (
                                <input
                                    type="text"
                                    value={draftValue}
                                    onChange={(event) => setDraftValue(event.target.value)}
                                    maxLength={40}
                                    placeholder="Enter a display name"
                                    className="mt-2 w-full rounded-md border border-(--border) bg-transparent px-3 py-2 outline-none focus:border-(--accent)"
                                />
                            ) : (
                                <p className="mt-1 text-lg">
                                    {profile.displayName || profile.username}
                                </p>
                            )}
                        </div>

                        {editingField === "displayName" ? (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={stopEditing}
                                    disabled={isSaving}
                                    className="h-10 rounded-md border border-(--border) px-3 py-2 text-sm"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    className="h-10 rounded-md bg-(--accent) px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                                >
                                    {isSaving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => startEditing("displayName")}
                                disabled={editingField !== null}
                                className="h-10 rounded-md border border-(--border) px-3 py-2 text-sm"
                            >
                                Edit
                            </button>
                        )}
                    </div>
                </div>

                {/* School */}
                <div className="border-b border-(--border) pb-4">
                    <div className="flex items-end justify-between gap-4">
                        <div className="flex-1">
                            <p className="text-sm text-(--text-h)"> School </p>

                            {editingField === "school" ? (
                                <select
                                    value={draftValue}
                                    onChange={(event) => setDraftValue(event.target.value)}
                                    className="mt-2 h-10 w-full rounded-md border border-(--border) bg-(--bg) px-3 py-2 outline-none focus:border-(--accent)"
                                >
                                    <option value=""> Select a school </option>
                                    {CUNY_SCHOOLS.map(
                                        (school) => (<option key={school} value={school}> {school} </option>)
                                    )}
                                </select>
                            ) : (
                                <p className="mt-1 text-lg">
                                    {profile.school || "Not selected"}
                                </p>
                            )}
                        </div>

                        {editingField === "school" ? (
                            <div className="flex shrink-0 gap-2">
                                <button
                                    type="button"
                                    onClick={stopEditing}
                                    disabled={isSaving}
                                    className="h-10 rounded-md border border-(--border) px-3 py-2 text-sm"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    className="h-10 rounded-md bg-(--accent) px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                                >
                                    {isSaving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => startEditing("school")}
                                disabled={editingField !== null}
                                className="rounded-md border border-(--border) px-3 py-2 text-sm"
                            >
                                Edit
                            </button>
                        )}
                    </div>
                </div>

                {/* Study Time */}
                <div>
                    <p className="text-sm text-(--text-h)"> Total Study Time </p>
                    <p className="mt-1 text-2xl font-semibold">
                        {formatTime(profile.totalStudyTime)}
                    </p>
                </div>
            </div>
        </section>
    );
}