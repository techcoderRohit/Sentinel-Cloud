import ContactQueries from '@/components/Admin/ContactQueries';

export default function AdminContactsPage() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Contact Queries</h1>
                <p className="text-slate-400 mt-2">Manage and respond to user messages and support requests.</p>
            </div>
            <ContactQueries />
        </div>
    );
}
