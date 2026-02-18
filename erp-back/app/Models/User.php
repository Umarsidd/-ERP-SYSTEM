<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = ['tableName', 'elementNumber', 'invoiceID', 'invoice', 'deactivated', 'role', 'status', 'createdBy', 'updatedBy', 'email_verified_at', 'settings', 'attachments',
        'name', 'createdAt', 'updatedAt',
        'email',
        'main',
        'password',
        'firstName',
        'emailConfirmation',
        'issueDate',
        'meta',
        'lastName',
        'phone',
        'deleted_at',
        'gender',
        'image',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * إرجاع مصفوفة تحتوي على أي بيانات مخصصة لإضافتها إلى JWT.
     */
    public function getJWTCustomClaims()
    {
        return ['user_id' => $this->id,
            'email' => $this->email, ];
    }
}
