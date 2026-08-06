import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/client";

export async function createUserProfile(uid: string, data: { name: string; email: string }): Promise<void> {
  await setDoc(doc(getFirestoreDb(), "users", uid), {
    name: data.name,
    email: data.email,
    createdAt: serverTimestamp(),
  });
}
