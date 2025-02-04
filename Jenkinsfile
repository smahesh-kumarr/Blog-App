pipeline {
    agent any

    environment {
        SONAR_URL = "http://54.85.130.134:9000"
        DOCKER_REGISTRY = "https://index.docker.io/"
        DOCKER_IMAGE_FRONTEND = "maheshkumars772/frontend:latest"
        DOCKER_IMAGE_BACKEND = "maheshkumars772/backend:latest"
        REGISTRY_CREDENTIALS = credentials('docker-cred')
        NODE_OPTIONS = "--openssl-legacy-provider"
    }

    stages {
        stage('System Cleanup') {
            steps {
                sh '''#!/bin/bash -e
                    docker system prune -af || true
                    npm cache clean --force
                    find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
                    df -h
                    du -sh *
                '''
            }
        }
        stage('Clean Workspace & Checkout') {
            steps {
                cleanWs()
                sh 'mkdir -p ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts'
                git branch: 'main', url: 'https://github.com/smahesh-kumarr/Blog-App.git'
            }
        }

        stage('Frontend Pipeline') {
            stages {
                stage('Frontend Dependencies') {
                    steps {
                        sh '''#!/bin/bash -e
                            cd client
                            npm install react@18.2.0 react-dom@18.2.0 --legacy-peer-deps --save
                            npm install --legacy-peer-deps --force --loglevel=error
                        '''
                    }
                }

                stage('Frontend Build') {
                    steps {
                        sh '''#!/bin/bash -e
                            cd client
                            DISABLE_ESLINT_PLUGIN=true npm run build
                        '''
                    }
                }

                stage('Frontend SonarQube') {
                    steps {
                        withCredentials([string(credentialsId: 'sonarqube', variable: 'SONAR_AUTH_TOKEN')]) {
                            sh '''
                                cd client
                                npx sonar-scanner \
                                    -Dsonar.projectKey=frontend-project \
                                    -Dsonar.sources=src \
                                    -Dsonar.host.url=${SONAR_URL} \
                                    -Dsonar.login=${SONAR_AUTH_TOKEN} \
                                    -Dsonar.scm.disabled=true
                            '''
                        }
                    }
                }

                stage('Frontend Docker') {
                    steps {
                        script {
                            withCredentials([usernamePassword(
                                credentialsId: 'docker-cred',
                                usernameVariable: 'DOCKER_USER',
                                passwordVariable: 'DOCKER_PASS'
                            )]) {
                                sh '''
                                    # Enable Docker BuildKit
                                    export DOCKER_BUILDKIT=1
                                    
                                    # Clean Docker cache
                                    docker builder prune -af
                                    
                                    # Build with cache optimization
                                    docker build \
                                        --progress=plain \
                                        --no-cache \
                                        -t ${DOCKER_IMAGE_FRONTEND} \
                                        ./client
                                    
                                    # Push and cleanup
                                    docker push ${DOCKER_IMAGE_FRONTEND}
                                    docker rmi ${DOCKER_IMAGE_FRONTEND}
                                '''
                            }
                        }
                    }
                }
            }
        }

        stage('Backend Pipeline') {
            stages {
                stage('Backend Dependencies') {
                    steps {
                        sh '''#!/bin/bash -e
                            cd api
                            npm install --force --loglevel=error
                        '''
                    }
                }

                stage('Backend Build') {
                    steps {
                        sh '''#!/bin/bash -e
                            cd api
                            npm run build
                        '''
                    }
                }

                stage('Backend SonarQube') {
                    steps {
                        withCredentials([string(credentialsId: 'sonarqube', variable: 'SONAR_AUTH_TOKEN')]) {
                            sh '''
                                cd api
                                npx sonar-scanner \
                                    -Dsonar.projectKey=backend-project \
                                    -Dsonar.sources=. \
                                    -Dsonar.host.url=${SONAR_URL} \
                                    -Dsonar.login=${SONAR_AUTH_TOKEN} \
                                    -Dsonar.scm.disabled=true
                            '''
                        }
                    }
                }

                stage('Backend Docker') {
                    steps {
                        script {
                            withCredentials([usernamePassword(
                                credentialsId: 'docker-cred',
                                usernameVariable: 'DOCKER_USER',
                                passwordVariable: 'DOCKER_PASS'
                            )]) {
                                sh '''
                                    # Enable Docker BuildKit
                                    export DOCKER_BUILDKIT=1
                                    
                                    # Clean Docker cache
                                    docker builder prune -af
                                    
                                    # Build with cache optimization
                                    docker build \
                                        --progress=plain \
                                        --no-cache \
                                        -t ${DOCKER_IMAGE_FRONTEND} \
                                        ./client
                                    
                                    # Push and cleanup
                                    docker push ${DOCKER_IMAGE_FRONTEND}
                                    docker rmi ${DOCKER_IMAGE_FRONTEND}
                                '''
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}