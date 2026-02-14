import { parseEmail } from '../src/services/parser';

const mockEmails = [
    {
        id: '1',
        snippet: 'Your interview for the MBA program is scheduled for Feb 20th 2024.',
        payload: {
            headers: [
                { name: 'Subject', value: 'IIMA: Interview Call Letter' },
                { name: 'From', value: 'admissions@iima.ac.in' }
            ]
        },
        internalDate: new Date('2024-02-10').getTime().toString()
    },
    {
        id: '2',
        snippet: 'We are pleased to shortlist you for the next round.',
        payload: {
            headers: [
                { name: 'Subject', value: 'Shortlist Announcement' },
                { name: 'From', value: 'admissions@isb.edu' }
            ]
        },
        internalDate: new Date('2024-01-15').getTime().toString()
    },
    {
        id: '3',
        snippet: 'The entrance test will be held on 15th March 2024.',
        payload: {
            headers: [
                { name: 'Subject', value: 'Entrance Test Schedule' },
                { name: 'From', value: 'tests@xlri.ac.in' }
            ]
        },
        internalDate: new Date('2024-02-01').getTime().toString()
    }
];

console.log('Running Parser Tests...\n');

mockEmails.forEach(email => {
    const result = parseEmail(email);
    console.log(`Subject: ${result.subject}`);
    console.log(`Type: ${result.type}`);
    console.log(`Institution: ${result.institution}`);
    console.log(`Event Date: ${result.eventDate ? new Date(result.eventDate).toDateString() : 'Not found'}`);
    console.log('---\n');
});
