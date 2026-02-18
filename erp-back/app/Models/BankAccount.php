<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class BankAccount extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'bank_accounts';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'tableName',
        'elementNumber',
        'name',
        'accountNumber',
        'type',
        'currency',
        'currentBalance',
        'openingBalance',
        'totalAmount',
        'status',
        'description',
        'depositChoice',
        'deposit',
        'main',
        'createdBy',
        'updatedBy',
        'createdAt',
        'updatedAt',
        'issueDate',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'currentBalance' => 'decimal:2',
        'openingBalance' => 'decimal:2',
        'totalAmount' => 'decimal:2',
        'deposit' => 'decimal:2',
        'createdAt' => 'datetime',
        'updatedAt' => 'datetime',
        'issueDate' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get conversions where this account is the source.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function conversionsFrom()
    {
        return $this->hasMany(TreasuryConversion::class, 'fromSafeId');
    }

    /**
     * Get conversions where this account is the destination.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function conversionsTo()
    {
        return $this->hasMany(TreasuryConversion::class, 'toSafeId');
    }

    /**
     * Get all conversions involving this account.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function allConversions()
    {
        return TreasuryConversion::where('fromSafeId', $this->id)
            ->orWhere('toSafeId', $this->id)
            ->orderBy('conversionDate', 'desc')
            ->get();
    }

    /**
     * Scope a query to only include active accounts.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['Active', 'Main']);
    }

    /**
     * Scope a query to only include safes (not banks).
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSafes($query)
    {
        return $query->where('type', '!=', 'Bank');
    }

    /**
     * Scope a query to only include banks.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeBanks($query)
    {
        return $query->where('type', 'Bank');
    }

    /**
     * Add amount to the current balance.
     *
     * @param float $amount
     * @return bool
     */
    public function addBalance($amount)
    {
        if ($amount <= 0) {
            return false;
        }

        $this->currentBalance += $amount;
        $this->totalAmount = $this->currentBalance;

        return $this->save();
    }

    /**
     * Deduct amount from the current balance.
     *
     * @param float $amount
     * @return bool
     * @throws \Exception
     */
    public function deductBalance($amount)
    {
        if ($amount <= 0) {
            throw new \Exception('Amount must be greater than zero');
        }

        if ($this->currentBalance < $amount) {
            throw new \Exception('Insufficient balance');
        }

        $this->currentBalance -= $amount;
        $this->totalAmount = $this->currentBalance;

        return $this->save();
    }

    /**
     * Update balance with validation (atomic operation).
     *
     * @param float $amount
     * @param string $operation 'add' or 'deduct'
     * @return bool
     * @throws \Exception
     */
    public function updateBalance($amount, $operation = 'add')
    {
        return DB::transaction(function () use ($amount, $operation) {
            // Lock the row for update
            $account = self::where('id', $this->id)->lockForUpdate()->first();

            if (!$account) {
                throw new \Exception('Account not found');
            }

            if ($operation === 'add') {
                return $account->addBalance($amount);
            } elseif ($operation === 'deduct') {
                return $account->deductBalance($amount);
            } else {
                throw new \Exception('Invalid operation. Use "add" or "deduct"');
            }
        });
    }

    /**
     * Check if the account has sufficient balance.
     *
     * @param float $amount
     * @return bool
     */
    public function hasSufficientBalance($amount)
    {
        return $this->currentBalance >= $amount;
    }

    /**
     * Get the balance after a hypothetical transaction.
     *
     * @param float $amount
     * @param string $operation 'add' or 'deduct'
     * @return float
     */
    public function getBalanceAfter($amount, $operation = 'add')
    {
        if ($operation === 'add') {
            return $this->currentBalance + $amount;
        } elseif ($operation === 'deduct') {
            return $this->currentBalance - $amount;
        }
        return $this->currentBalance;
    }

    /**
     * Reset balance to opening balance.
     *
     * @return bool
     */
    public function resetBalance()
    {
        $this->currentBalance = $this->openingBalance;
        $this->totalAmount = $this->currentBalance;

        return $this->save();
    }

    /**
     * Get formatted balance information.
     *
     * @return array
     */
    public function getBalanceInfo()
    {
        return [
            'current' => number_format($this->currentBalance, 2),
            'opening' => number_format($this->openingBalance, 2),
            'difference' => number_format($this->currentBalance - $this->openingBalance, 2),
            'currency' => $this->currency,
        ];
    }

    /**
     * Check if this is a main account.
     *
     * @return bool
     */
    public function isMain()
    {
        return $this->status === 'Main';
    }

    /**
     * Check if this is an active account.
     *
     * @return bool
     */
    public function isActive()
    {
        return in_array($this->status, ['Active', 'Main']);
    }

    /**
     * Get total conversions count.
     *
     * @return int
     */
    public function getTotalConversionsCount()
    {
        return TreasuryConversion::where('fromSafeId', $this->id)
            ->orWhere('toSafeId', $this->id)
            ->count();
    }

    /**
     * Get total amount transferred from this account.
     *
     * @return float
     */
    public function getTotalTransferredOut()
    {
        return TreasuryConversion::where('fromSafeId', $this->id)
            ->where('status', 'Completed')
            ->sum('amount');
    }

    /**
     * Get total amount received by this account.
     *
     * @return float
     */
    public function getTotalTransferredIn()
    {
        return TreasuryConversion::where('toSafeId', $this->id)
            ->where('status', 'Completed')
            ->sum('amount');
    }

    /**
     * Get net transfer amount (in - out).
     *
     * @return float
     */
    public function getNetTransferAmount()
    {
        return $this->getTotalTransferredIn() - $this->getTotalTransferredOut();
    }
}
