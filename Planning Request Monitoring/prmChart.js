function renderApprovalChart(data) {
    const brfStatuses = { Approved: 0, Pending: 0 };
    const prStatuses = { Approved: 0, Pending: 0 };
    const poStatuses = { Approved: 0, Pending: 0 };

    const isApproved = (value) => {
        if (!value) return false;
        const val = value.trim().toLowerCase();
        return (
            val === 'approved' ||
            val === 'approved for payment / upload to share point' ||
            val === 'approve for payment'
        );
    };

    const isPending = (value) => {
        if (!value) return false;
        const val = value.trim().toLowerCase();
        return (
            val === 'pending' ||
            val === 'for approval' ||
            val === 'for revision'
        );
    };

    data.forEach(row => {
        const brfStatus = row['BRF STATUS'];
        const prStatus = row['PR STATUS'];
        const poStatus = row['PO/WO STATUS'];

        // BRF
        if (isApproved(brfStatus)) brfStatuses.Approved++;
        else if (isPending(brfStatus)) brfStatuses.Pending++;

        // PR
        if (isApproved(prStatus)) prStatuses.Approved++;
        else if (isPending(prStatus)) prStatuses.Pending++;

        // PO
        if (isApproved(poStatus)) poStatuses.Approved++;
        else if (isPending(poStatus)) poStatuses.Pending++;
    });

    const ctx = document.getElementById('approvalBarChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['BRF', 'PR', 'PO/WO'],
            datasets: [
                {
                    label: 'Approved',
                    data: [brfStatuses.Approved, prStatuses.Approved, poStatuses.Approved],
                    backgroundColor: '#28a745'
                },
                {
                    label: 'Pending',
                    data: [brfStatuses.Pending, prStatuses.Pending, poStatuses.Pending],
                    backgroundColor: '#ffc107'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: {
                    display: true,
                    text: 'Approval Status of BRF, PR, and PO/WO'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    precision: 0
                }
            }
        }
    });
}
