const { PrismaClient, UserRole, HelpRequestStatus, AssignmentStatus, NotificationType, MissionCategory, ReportStatus, TokenType, CancelActor, CancelStage, CancelReasonCode } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Refining Seeding with realistic data...');

  const hashedPassword = await bcrypt.hash('admin1234', 10);

  // 1. Users (Realistic Indonesian Names)
  const indonesianNames = [
    'Budi Santoso', 'Siti Aminah', 'Agus Setiawan', 'Dewi Lestari', 'Bambang Pamungkas',
    'Ani Suryani', 'Rizky Ramadhan', 'Indah Permata', 'Eko Prasetyo', 'Maya Sari',
    'Adi Wijaya', 'Fitri Handayani', 'Hendra Gunawan', 'Sari Wahyuni', 'Lukman Hakim'
  ];

  const users = [];
  for (let i = 0; i < indonesianNames.length; i++) {
    users.push(await prisma.user.upsert({
      where: { email: `user${i + 1}@example.com` },
      update: { full_name: indonesianNames[i] },
      create: {
        full_name: indonesianNames[i],
        email: `user${i + 1}@example.com`,
        phone: `0812345678${(i + 1).toString().padStart(2, '0')}`,
        password: hashedPassword,
        points: (i + 1) * 10,
        reputation_score: 95,
        role: i === 0 ? UserRole.ADMIN : UserRole.USER,
        isVerified: true,
      },
    }));
  }
  console.log('Users updated with realistic names.');

  // 2. Clear dynamic data to avoid duplicates/confusion if needed, 
  // but Prisma create/upsert handles unique constraints. 
  // For HelpRequest, we'll just add new ones or update if possible.
  // Actually, let's just create new ones to reach the "minimal 10" goal efficiently.
  
  // 3. Realistic Help Requests around Gadog, Bogor
  // Center: -6.6527, 106.8668 (Gadog/Pandansari)
  const gadogLat = -6.6527;
  const gadogLng = 106.8668;

  const scenarios = [
    { title: 'Bantu dorong mobil mogok', desc: 'Mobil saya mogok di dekat tanjakan Selarong, butuh bantuan dorong ke pinggir.', cat: 'Tenaga' },
    { title: 'Pinjam pompa ban motor', desc: 'Ban motor kempes depan Alfamart Pandansari, ada yang punya pompa?', cat: 'Barang' },
    { title: 'Bantu angkut belanjaan', desc: 'Barusan belanja banyak di Gadog, butuh bantuan angkut ke atas.', cat: 'Tenaga' },
    { title: 'Cari jasa benerin kran bocor', desc: 'Kran di dapur patah, butuh bantuan segera.', cat: 'Tenaga' },
    { title: 'Pinjam tangga lipat', desc: 'Butuh tangga lipat buat benerin lampu teras rumah.', cat: 'Barang' },
    { title: 'Bantu angkat galon air', desc: 'Lagi sakit pinggang, butuh bantuan angkat 3 galon ke lantai 2.', cat: 'Tenaga' },
    { title: 'Cari teman bareng ke Jakarta', desc: 'Mau naik bus di Gadog, ada yang mau bareng biar lebih aman?', cat: 'Lainnya' },
    { title: 'Tolong belikan obat flu', desc: 'Lagi demam tinggi tidak bisa keluar, tolong belikan obat di apotek terdekat.', cat: 'Lainnya' },
    { title: 'Bantu cari kucing hilang', desc: 'Kucing warna oranye hilang di sekitar desa Pandansari, mohon infonya.', cat: 'Lainnya' },
    { title: 'Bantu pindahin lemari', desc: 'Mau geser lemari berat ke kamar sebelah, butuh satu orang lagi.', cat: 'Tenaga' },
    { title: 'Pinjam obeng kembang', desc: 'Mau buka casing PC tapi obeng hilang, ada yang dekat sini?', cat: 'Barang' },
    { title: 'Bantu bersihin halaman', desc: 'Halaman banyak sampah daun kering setelah badai, butuh bantuan sapu.', cat: 'Tenaga' },
    { title: 'Tanya info bengkel buka', desc: 'Ada yang tahu bengkel motor yang buka hari Minggu di sekitar sini?', cat: 'Lainnya' },
    { title: 'Bantu pasang gas elpiji', desc: 'Takut pasang sendiri, ada yang bisa bantu pasangkan ke kompor?', cat: 'Tenaga' },
    { title: 'Pinjam payung sebentar', desc: 'Terjebak hujan di halte, ada yang punya payung lebih?', cat: 'Barang' }
  ];

  const helpRequests = [];
  for (let i = 0; i < scenarios.length; i++) {
    const requester = users[i % users.length];
    helpRequests.push(await prisma.helpRequest.create({
      data: {
        user_id: requester.id,
        title: scenarios[i].title,
        description: scenarios[i].desc,
        category: scenarios[i].cat,
        latitude: gadogLat + (Math.random() * 0.01 - 0.005),
        longitude: gadogLng + (Math.random() * 0.01 - 0.005),
        status: i % 3 === 0 ? HelpRequestStatus.OPEN : i % 3 === 1 ? HelpRequestStatus.TAKEN : HelpRequestStatus.COMPLETED,
      },
    }));
  }
  console.log('Help Requests updated with realistic scenarios and Gadog locations.');

  // 4. Help Assignments for these realistic requests
  const assignments = [];
  for (let i = 0; i < helpRequests.length; i++) {
    const hr = helpRequests[i];
    if (hr.status !== HelpRequestStatus.OPEN) {
        const helper = users[(i + 1) % users.length];
        if (hr.user_id !== helper.id) {
            assignments.push(await prisma.helpAssignment.create({
              data: {
                help_request_id: hr.id,
                helper_id: helper.id,
                status: hr.status === HelpRequestStatus.COMPLETED ? AssignmentStatus.COMPLETED : AssignmentStatus.CONFIRMED,
                taken_at: new Date(),
                confirmed_at: hr.status === HelpRequestStatus.COMPLETED ? new Date() : null,
                completed_at: hr.status === HelpRequestStatus.COMPLETED ? new Date() : null,
              },
            }));
        }
    }
  }
  console.log('Help Assignments updated.');

  // 5. Chat Rooms and Messages for active assignments
  for (const assignment of assignments) {
      if (assignment.status !== AssignmentStatus.COMPLETED) {
          const chatRoom = await prisma.chatRoom.upsert({
            where: { assignment_id: assignment.id },
            update: { is_active: true },
            create: {
              help_request_id: assignment.help_request_id,
              assignment_id: assignment.id,
              is_active: true,
            },
          });

          await prisma.chatMessage.createMany({
            data: [
              { chat_room_id: chatRoom.id, sender_id: assignment.helper_id, message: 'Halo, saya bisa bantu. Lokasi persisnya di mana ya?' },
              { chat_room_id: chatRoom.id, sender_id: (await prisma.helpRequest.findUnique({ where: { id: assignment.help_request_id } })).user_id, message: 'Halo! Saya di depan warung bu Siti. Dekat pertigaan.' },
              { chat_room_id: chatRoom.id, sender_id: assignment.helper_id, message: 'Oke, saya meluncur sekarang.' }
            ]
          });
      }
  }
  console.log('Chat Rooms and Messages updated with realistic conversations.');

  console.log('Seeding refinement completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
