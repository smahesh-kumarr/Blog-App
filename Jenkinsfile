pipeline {
    agent {
        docker {
            image 'node:latest'
        }
    }
    environment {
        SONAR_URL = "http://54.85.130.134:9000"
        DOCKER_IMAGE_FRONTEND = "maheshkumars772/frontend:latest"
        DOCKER_IMAGE_BACKEND = "maheshkumars772/backend:latest"
        REGISTRY_CREDENTIALS = credentials('docker-cred')
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/smahesh-kumarr/Blog-App.git'
            }
        }
        stage('Build & Test in Parallel') {
            parallel {
                stage('Frontend Build & Test') {
                    steps {
                        sh '''
                            cd client
                            rm -rf node_modules package-lock.json
                            npm cache clean --force
                            npm install --legacy-peer-deps
                            npm run build
                            npm test
                        '''
                    }
                }
                stage('Backend Build & Test') {
                    steps {
                        sh '''
                            cd api
                            rm -rf node_modules package-lock.json
                            npm cache clean --force
                            npm install --legacy-peer-deps
                            npm test
                        '''
                    }
                }
            }
        }
        stage('Static Code Analysis - Parallel') {
            parallel {
                stage('SonarQube Frontend') {
                    steps {
                        withCredentials([string(credentialsId: 'sonarqube', variable: 'SONAR_AUTH_TOKEN')]) {
                            sh '''
                                cd client
                                npx sonar-scanner \
                                -Dsonar.projectKey=frontend-project \
                                -Dsonar.sources=src \
                                -Dsonar.host.url=${SONAR_URL} \
                                -Dsonar.login=$SONAR_AUTH_TOKEN
                            '''
                        }
                    }
                }
                stage('SonarQube Backend') {
                    steps {
                        withCredentials([string(credentialsId: 'sonarqube', variable: 'SONAR_AUTH_TOKEN')]) {
                            sh '''
                                cd api
                                npx sonar-scanner \
                                -Dsonar.projectKey=backend-project \
                                -Dsonar.sources=. \
                                -Dsonar.host.url=${SONAR_URL} \
                                -Dsonar.login=$SONAR_AUTH_TOKEN
                            '''
                        }
                    }
                }
            }
        }
        stage('Build & Push Docker Images - Parallel') {
            parallel {
                stage('Build & Push Frontend') {
                    steps {
                        script {
                            sh 'cd client && docker build -t ${DOCKER_IMAGE_FRONTEND} .'
                            docker.withRegistry('https://index.docker.io/v1/', "docker-cred") {
                                sh 'docker push ${DOCKER_IMAGE_FRONTEND}'
                            }
                        }
                    }
                }
                stage('Build & Push Backend') {
                    steps {
                        script {
                            sh 'cd api && docker build -t ${DOCKER_IMAGE_BACKEND} .'
                            docker.withRegistry('https://index.docker.io/v1/', "docker-cred") {
                                sh 'docker push ${DOCKER_IMAGE_BACKEND}'
                            }
                        }
                    }
                }
            }
        }
    }
}
