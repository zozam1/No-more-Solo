import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'flirt',
  brand: {
    displayName: '이게 플러팅이야?', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: '#ff5fb0', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: 'https://flirt-vote.netlify.app/logo.png', // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
});
