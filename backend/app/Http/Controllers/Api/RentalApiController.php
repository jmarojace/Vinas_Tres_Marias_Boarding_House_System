<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class RentalApiController extends Controller
{
    private function userData(User $user): array
    {
        return $user->only(['id', 'name', 'email', 'role', 'status', 'tenant_id', 'contact_number', 'emergency_contact']);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email'], 'password' => ['required', 'string']]);
        $user = User::where('email', $data['email'])->first();
        if (!$user || !Hash::check($data['password'], $user->password)) return response()->json(['message' => 'The email or password is incorrect.'], 422);
        if ($user->status !== 'active') return response()->json(['message' => 'This account is waiting for administrator approval.'], 403);
        return response()->json(['user' => $this->userData($user), 'token' => $user->createToken('boarding-house-web')->plainTextToken]);
    }

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:120'], 'email' => ['required', 'email', 'max:190', 'unique:users'], 'password' => ['required', 'string', 'min:8'], 'role' => ['required', Rule::in(['tenant', 'staff'])], 'contact_number' => ['nullable', 'string', 'max:40'], 'emergency_contact' => ['nullable', 'string', 'max:190']]);
        if ($data['role'] === 'tenant' && empty($data['contact_number'])) return response()->json(['message' => 'A contact number is required for tenant accounts.'], 422);
        User::create([...$data, 'status' => 'pending']);
        return response()->json(['message' => 'Your request was sent. Wait for the administrator to approve it before signing in.'], 201);
    }

    public function logout(Request $request): JsonResponse { $request->user()->currentAccessToken()?->delete(); return response()->json(['message' => 'Signed out.']); }
    public function me(Request $request): JsonResponse { return response()->json(['user' => $this->userData($request->user())]); }

    public function snapshot(Request $request): JsonResponse
    {
        $record = \DB::table('property_snapshots')->where('key', 'main')->first();
        if ($request->isMethod('put')) {
            $data = $request->validate(['data' => ['required', 'array']])['data'];
            \DB::table('property_snapshots')->updateOrInsert(['key' => 'main'], ['data' => json_encode($data), 'updated_by' => $request->user()->id, 'updated_at' => now(), 'created_at' => $record?->created_at ?? now()]);
            return response()->json(['message' => 'Saved.']);
        }
        return response()->json(['data' => $record ? json_decode($record->data, true) : null]);
    }

    public function notifications(Request $request): JsonResponse
    {
        $pendingAccounts = $request->user()->role === 'admin' ? User::where('status', 'pending')->count() : 0;
        $data = $this->propertyData();
        $pendingMaintenance = collect($data['maintenance'] ?? [])->where('status', 'Pending')->count();
        return response()->json(['account_requests' => $pendingAccounts, 'maintenance' => $pendingMaintenance, 'tenant_updates' => $request->user()->role === 'tenant' ? $pendingMaintenance : 0]);
    }

    private function propertyData(): array
    {
        $record = \DB::table('property_snapshots')->where('key', 'main')->first();
        return $record ? (json_decode($record->data, true) ?: []) : [];
    }

    public function users(Request $request): JsonResponse
    {
        if ($request->isMethod('get')) return response()->json(['data' => User::orderByDesc('id')->limit(min((int)$request->query('per_page', 100), 200))->get()->map(fn(User $u) => $this->userData($u))]);
        $data = $request->validate(['name' => ['required', 'string', 'max:120'], 'email' => ['required', 'email', 'max:190', 'unique:users'], 'password' => ['required', 'string', 'min:8'], 'role' => ['required', Rule::in(['admin', 'staff', 'tenant'])], 'tenant_id' => ['nullable', 'integer'], 'contact_number' => ['nullable', 'string', 'max:40'], 'emergency_contact' => ['nullable', 'string', 'max:190']]);
        if ($data['role'] === 'tenant' && empty($data['tenant_id'])) {
            $snapshot = $this->propertyData();
            $tenants = collect($snapshot['tenants'] ?? []);
            $tenantId = ((int)$tenants->max('id')) + 1;
            $snapshot['tenants'] = [...$tenants->all(), ['id' => $tenantId, 'full_name' => $data['name'], 'email' => $data['email'], 'contact_number' => $data['contact_number'] ?? '', 'emergency_contact' => $data['emergency_contact'] ?? '', 'room' => '', 'move_in_date' => '', 'move_out_date' => '', 'status' => 'Active']];
            \DB::table('property_snapshots')->updateOrInsert(['key' => 'main'], ['data' => json_encode($snapshot), 'updated_by' => $request->user()->id, 'updated_at' => now(), 'created_at' => now()]);
            $data['tenant_id'] = $tenantId;
        }
        $user = User::create([...$data, 'status' => 'active']);
        return response()->json(['data' => $this->userData($user)], 201);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $data = $request->validate(['status' => ['required', Rule::in(['active', 'pending', 'disabled'])]]);
        $user->update($data);
        if ($user->status === 'active' && $user->role === 'tenant' && !$user->tenant_id) {
            $snapshot = $this->propertyData();
            $tenants = collect($snapshot['tenants'] ?? []);
            $tenant = $tenants->first(fn($row) => strtolower($row['email'] ?? '') === strtolower($user->email));
            if (!$tenant) {
                $tenantId = ((int)$tenants->max('id')) + 1;
                $tenant = ['id' => $tenantId, 'full_name' => $user->name, 'email' => $user->email, 'contact_number' => $user->contact_number ?? '', 'emergency_contact' => $user->emergency_contact ?? '', 'room' => '', 'move_in_date' => '', 'move_out_date' => '', 'status' => 'Active'];
                $snapshot['tenants'] = [...$tenants->all(), $tenant];
                \DB::table('property_snapshots')->updateOrInsert(['key' => 'main'], ['data' => json_encode($snapshot), 'updated_by' => $request->user()->id, 'updated_at' => now(), 'created_at' => now()]);
            }
            $user->update(['tenant_id' => $tenant['id']]);
        }
        return response()->json(['data' => $this->userData($user)]);
    }

    public function tenantPortal(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->role === 'tenant', 403);
        $data = $this->propertyData();
        $tenant = collect($data['tenants'] ?? [])->first(fn($t) => ($user->tenant_id && (string)($t['id'] ?? '') === (string)$user->tenant_id) || strtolower($t['email'] ?? '') === strtolower($user->email));
        if (!$tenant) return response()->json(['message' => 'Your account is not linked to a tenant profile yet.'], 404);
        $room = collect($data['rooms'] ?? [])->first(fn($r) => ($r['room_number'] ?? null) === ($tenant['room'] ?? null));
        $agreement = collect($data['agreements'] ?? [])->first(fn($a) => ($a['tenant'] ?? null) === ($tenant['full_name'] ?? null) && ($a['status'] ?? '') !== 'Ended');
        $payments = collect($data['payments'] ?? [])->filter(fn($p) => ($p['tenant'] ?? null) === ($tenant['full_name'] ?? null))->values();
        $period = now()->format('F Y');
        $paidThisPeriod = $payments->where('payment_period', $period)->sum(fn($payment) => (float)($payment['amount'] ?? 0));
        $agreementView = $agreement ? [...$agreement, 'room_number' => $agreement['room'] ?? ($tenant['room'] ?? '—'), 'room_type' => $room['room_type'] ?? 'Room', 'floor' => $room['floor'] ?? '—', 'agreement_status' => $agreement['status'] ?? 'Active', 'payment_period' => $period, 'paid_this_period' => $paidThisPeriod, 'balance' => max(0, (float)($agreement['monthly_rate'] ?? 0) - $paidThisPeriod), 'due_date' => null] : null;
        $maintenance = collect($data['maintenance'] ?? [])->filter(fn($m) => ($m['tenant'] ?? null) === ($tenant['full_name'] ?? null))->map(fn($m) => [...$m, 'room_number' => $m['room'] ?? '—', 'submitted_at' => $m['submitted_at'] ?? now()->toDateString()])->values();
        return response()->json(['tenant' => $tenant, 'room' => $room, 'agreement' => $agreementView, 'payments' => $payments, 'maintenance' => $maintenance]);
    }

    public function submitMaintenance(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->role === 'tenant', 403);
        $data = $this->propertyData();
        $tenant = collect($data['tenants'] ?? [])->first(fn($t) => strtolower($t['email'] ?? '') === strtolower($user->email) || ($user->tenant_id && (string)($t['id'] ?? '') === (string)$user->tenant_id));
        if (!$tenant) return response()->json(['message' => 'Your account is not linked to a tenant profile yet.'], 422);
        $payload = $request->validate(['title' => ['required', 'string', 'max:150'], 'description' => ['required', 'string', 'max:2000'], 'priority' => ['required', Rule::in(['Low', 'Medium', 'High'])]]);
        $rows = collect($data['maintenance'] ?? []);
        $payload = [...$payload, 'id' => ((int)$rows->max('id')) + 1, 'tenant' => $tenant['full_name'], 'room' => $tenant['room'] ?? '—', 'status' => 'Pending', 'submitted_at' => now()->toDateString(), 'resolved_at' => ''];
        $data['maintenance'] = [...$rows->all(), $payload];
        \DB::table('property_snapshots')->updateOrInsert(['key' => 'main'], ['data' => json_encode($data), 'updated_by' => $user->id, 'updated_at' => now(), 'created_at' => now()]);
        return response()->json(['data' => $payload], 201);
    }

    public function updateMaintenance(Request $request, int $id): JsonResponse
    {
        $data = $this->propertyData();
        $rows = collect($data['maintenance'] ?? []);
        abort_unless($rows->contains(fn($row) => (int)($row['id'] ?? 0) === $id), 404);
        $patch = $request->validate(['status' => ['sometimes', Rule::in(['Pending', 'In Progress', 'Resolved'])], 'resolved_at' => ['nullable', 'date']]);
        $data['maintenance'] = $rows->map(fn($row) => (int)$row['id'] === $id ? [...$row, ...$patch] : $row)->all();
        \DB::table('property_snapshots')->where('key', 'main')->update(['data' => json_encode($data), 'updated_by' => $request->user()->id, 'updated_at' => now()]);
        return response()->json(['message' => 'Updated.']);
    }

    public function deleteMaintenance(Request $request, int $id): JsonResponse
    {
        $data = $this->propertyData();
        $data['maintenance'] = collect($data['maintenance'] ?? [])->reject(fn($row) => (int)($row['id'] ?? 0) === $id)->values()->all();
        \DB::table('property_snapshots')->where('key', 'main')->update(['data' => json_encode($data), 'updated_by' => $request->user()->id, 'updated_at' => now()]);
        return response()->json(['message' => 'Deleted.']);
    }
}
