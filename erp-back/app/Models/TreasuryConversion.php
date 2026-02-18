<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TreasuryConversion extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'treasury_conversions';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'elementNumber',
        'fromSafeId',
        'toSafeId',
        'amount',
        'fromSafeBalanceBefore',
        'fromSafeBalanceAfter',
        'toSafeBalanceBefore',
        'toSafeBalanceAfter',
        'conversionDate',
        'notes',
        'status',
        'createdBy',
        'updatedBy',
        'createdAt',
        'updatedAt',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'fromSafeBalanceBefore' => 'decimal:2',
        'fromSafeBalanceAfter' => 'decimal:2',
        'toSafeBalanceBefore' => 'decimal:2',
        'toSafeBalanceAfter' => 'decimal:2',
        'conversionDate' => 'date',
        'createdAt' => 'datetime',
        'updatedAt' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the source safe (from safe).
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function fromSafe()
    {
        return $this->belongsTo(BankAccount::class, 'fromSafeId');
    }

    /**
     * Get the destination safe (to safe).
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function toSafe()
    {
        return $this->belongsTo(BankAccount::class, 'toSafeId');
    }

    /**
     * Scope a query to only include conversions for a specific safe.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $safeId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForSafe($query, $safeId)
    {
        return $query->where('fromSafeId', $safeId)
            ->orWhere('toSafeId', $safeId);
    }

    /**
     * Scope a query to only include completed conversions.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'Completed');
    }

    /**
     * Scope a query to filter by date range.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $from
     * @param string $to
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDateRange($query, $from, $to)
    {
        return $query->whereBetween('conversionDate', [$from, $to]);
    }

    /**
     * Get the balance change for a specific safe.
     *
     * @param int $safeId
     * @return float
     */
    public function getBalanceChangeForSafe($safeId)
    {
        if ($this->fromSafeId == $safeId) {
            return -$this->amount; // Deduction
        } elseif ($this->toSafeId == $safeId) {
            return $this->amount; // Addition
        }
        return 0;
    }

    /**
     * Check if the conversion involves a specific safe.
     *
     * @param int $safeId
     * @return bool
     */
    public function involvesSafe($safeId)
    {
        return $this->fromSafeId == $safeId || $this->toSafeId == $safeId;
    }

    /**
     * Get formatted conversion details.
     *
     * @return array
     */
    public function getFormattedDetails()
    {
        return [
            'number' => $this->elementNumber,
            'date' => $this->conversionDate->format('Y-m-d'),
            'amount' => number_format($this->amount, 2),
            'from' => $this->fromSafe ? $this->fromSafe->name : 'Unknown',
            'to' => $this->toSafe ? $this->toSafe->name : 'Unknown',
            'status' => $this->status,
        ];
    }
}
